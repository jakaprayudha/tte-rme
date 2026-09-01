<?php

header("Content-Type: application/json; charset=UTF-8");

header("Access-Control-Allow-Origin: *");

header("Access-Control-Allow-Methods: POST, OPTIONS");

header("Access-Control-Allow-Headers: Content-Type");


/* =========================================
   HANDLE OPTIONS REQUEST
========================================= */

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {

   http_response_code(200);

   exit;
}


/* =========================================
   DATABASE
========================================= */

require_once __DIR__ . "/../config/database.php";


/* =========================================
   ONLY POST
========================================= */

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

   http_response_code(405);

   echo json_encode([

      "success" => false,

      "message" => "Method not allowed"

   ]);

   exit;
}


/* =========================================
   GET JSON DATA
========================================= */

$input = json_decode(
   file_get_contents("php://input"),
   true
);


/* =========================================
   VALIDATE INPUT
========================================= */

if (!$input || !is_array($input)) {

   http_response_code(400);

   echo json_encode([

      "success" => false,

      "message" => "Invalid request data"

   ]);

   exit;
}


/* =========================================
   GET DATA
========================================= */

$name = trim($input["name"] ?? "");

$position = trim($input["position"] ?? "");

$institution = trim($input["institution"] ?? "");

$email = trim($input["email"] ?? "");

$phone = trim($input["phone"] ?? "");

$city = trim($input["city"] ?? "");

$facility = trim($input["facility"] ?? "");

$product = trim($input["product"] ?? "");

$needs = trim($input["needs"] ?? "");

$demoDate = trim($input["date"] ?? "");

$demoTime = trim($input["time"] ?? "");


/* =========================================
   LOCATION DATA
========================================= */

$latitude = isset($input["latitude"]) &&
   $input["latitude"] !== null
   ? (float) $input["latitude"]
   : null;


$longitude = isset($input["longitude"]) &&
   $input["longitude"] !== null
   ? (float) $input["longitude"]
   : null;


$accuracy = isset($input["accuracy"]) &&
   $input["accuracy"] !== null
   ? (float) $input["accuracy"]
   : null;


$locationCapturedAt =
   trim($input["location_captured_at"] ?? "");


/* =========================================
   REQUIRED VALIDATION
========================================= */

if (

   empty($name) ||

   empty($position) ||

   empty($institution) ||

   empty($email) ||

   empty($phone) ||

   empty($product)

) {

   http_response_code(422);

   echo json_encode([

      "success" => false,

      "message" => "Mohon lengkapi semua data wajib"

   ]);

   exit;
}


/* =========================================
   EMAIL VALIDATION
========================================= */

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

   http_response_code(422);

   echo json_encode([

      "success" => false,

      "message" => "Format email tidak valid"

   ]);

   exit;
}


/* =========================================
   VALIDATE LOCATION
========================================= */

/*
   Location bersifat optional.

   Jika user menolak akses lokasi,
   request demo tetap dapat disimpan.
*/

if ($latitude !== null) {

   if ($latitude < -90 || $latitude > 90) {

      $latitude = null;
   }
}


if ($longitude !== null) {

   if ($longitude < -180 || $longitude > 180) {

      $longitude = null;
   }
}


/* =========================================
   FORMAT LOCATION TIMESTAMP
========================================= */

if (!empty($locationCapturedAt)) {

   try {

      $dateTime =
         new DateTime($locationCapturedAt);

      $locationCapturedAt =
         $dateTime->format("Y-m-d H:i:s");
   } catch (Exception $e) {

      $locationCapturedAt = null;
   }
} else {

   $locationCapturedAt = null;
}


/* =========================================
   INSERT DATABASE
========================================= */

try {

   $sql = "

        INSERT INTO demo_requests (

            name,

            position,

            institution,

            email,

            phone,

            city,

            facility,

            product,

            needs,

            demo_date,

            demo_time,

            latitude,

            longitude,

            location_accuracy,

            location_captured_at

        )

        VALUES (

            :name,

            :position,

            :institution,

            :email,

            :phone,

            :city,

            :facility,

            :product,

            :needs,

            :demo_date,

            :demo_time,

            :latitude,

            :longitude,

            :location_accuracy,

            :location_captured_at

        )

    ";


   $stmt = $pdo->prepare($sql);


   $stmt->execute([

      ":name" => $name,

      ":position" => $position,

      ":institution" => $institution,

      ":email" => $email,

      ":phone" => $phone,

      ":city" => $city ?: null,

      ":facility" => $facility ?: null,

      ":product" => $product,

      ":needs" => $needs ?: null,

      ":demo_date" => $demoDate ?: null,

      ":demo_time" => $demoTime ?: null,


      /* LOCATION */

      ":latitude" => $latitude,

      ":longitude" => $longitude,

      ":location_accuracy" => $accuracy,

      ":location_captured_at" => $locationCapturedAt

   ]);


   $requestId = $pdo->lastInsertId();


   /* =========================================
       SUCCESS RESPONSE
    ========================================= */

   echo json_encode([

      "success" => true,

      "message" => "Request demo berhasil dikirim",

      "data" => [

         "id" => $requestId,

         "name" => $name,

         "status" => "NEW",

         "location" => [

            "latitude" => $latitude,

            "longitude" => $longitude,

            "accuracy" => $accuracy

         ]

      ]

   ]);
} catch (PDOException $e) {

   http_response_code(500);


   echo json_encode([

      "success" => false,

      "message" => "Gagal menyimpan data request demo"

      /*
        DEVELOPMENT ONLY:

        "error" => $e->getMessage()
        */

   ]);
}
