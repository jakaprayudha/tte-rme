<?php

header("Content-Type: application/json; charset=UTF-8");

session_start();


/* =========================================
   ONLY POST
========================================= */

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

   http_response_code(405);

   echo json_encode([
      "success" => false,
      "message" => "Method tidak diizinkan"
   ]);

   exit;
}


/* =========================================
   DATABASE
========================================= */

require_once __DIR__ . "/../config/database.php";


/* =========================================
   GET JSON
========================================= */

$rawInput = file_get_contents("php://input");

$input = json_decode($rawInput, true);


/* =========================================
   VALIDATE JSON
========================================= */

if (!is_array($input)) {

   http_response_code(400);

   echo json_encode([
      "success" => false,
      "message" => "Data request tidak valid"
   ]);

   exit;
}


/* =========================================
   GET DATA
========================================= */

$username = trim($input["username"] ?? "");

$password = $input["password"] ?? "";


/* =========================================
   VALIDATION
========================================= */

if ($username === "" || $password === "") {

   http_response_code(422);

   echo json_encode([
      "success" => false,
      "message" => "Username dan password wajib diisi"
   ]);

   exit;
}


/* =========================================
   LOGIN
========================================= */

try {

   /* =========================================
       CHECK PDO
    ========================================= */

   if (!isset($pdo)) {

      throw new Exception("Koneksi database PDO tidak tersedia");
   }


   /* =========================================
       GET ADMIN
    ========================================= */

   $sql = "
        SELECT
            id,
            name,
            username,
            password,
            role,
            status

        FROM admins

        WHERE username = :username
        AND status = 'ACTIVE'

        LIMIT 1
    ";


   $stmt = $pdo->prepare($sql);


   $stmt->execute([
      ":username" => $username
   ]);


   $admin = $stmt->fetch(PDO::FETCH_ASSOC);


   /* =========================================
       USER NOT FOUND
    ========================================= */

   if (!$admin) {

      http_response_code(401);

      echo json_encode([
         "success" => false,
         "message" => "Username atau password salah"
      ]);

      exit;
   }


   /* =========================================
       VERIFY PASSWORD
    ========================================= */

   if (!password_verify($password, $admin["password"])) {

      http_response_code(401);

      echo json_encode([
         "success" => false,
         "message" => "Username atau password salah"
      ]);

      exit;
   }


   /* =========================================
       REGENERATE SESSION
    ========================================= */

   session_regenerate_id(true);


   /* =========================================
       CREATE SESSION
    ========================================= */

   $_SESSION["admin_logged_in"] = true;

   $_SESSION["admin_id"] = $admin["id"];

   $_SESSION["admin_name"] = $admin["name"];

   $_SESSION["admin_username"] = $admin["username"];

   $_SESSION["admin_role"] = $admin["role"];


   /* =========================================
       SUCCESS
    ========================================= */

   echo json_encode([
      "success" => true,
      "message" => "Login berhasil",
      "data" => [
         "id" => $admin["id"],
         "name" => $admin["name"],
         "username" => $admin["username"],
         "role" => $admin["role"]
      ]
   ]);

   exit;
} catch (Throwable $e) {

   http_response_code(500);

   echo json_encode([
      "success" => false,
      "message" => "Terjadi kesalahan pada server",

      /* DEVELOPMENT ONLY */
      "debug" => $e->getMessage(),

      "file" => basename($e->getFile()),

      "line" => $e->getLine()
   ]);

   exit;
}
