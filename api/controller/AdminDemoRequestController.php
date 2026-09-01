<?php

header("Content-Type: application/json; charset=UTF-8");

header("Access-Control-Allow-Origin: *");

require_once __DIR__ . "/../config/database.php";


/* =========================================
   GET REQUEST METHOD ONLY
========================================= */

if ($_SERVER["REQUEST_METHOD"] !== "GET") {

   http_response_code(405);

   echo json_encode([
      "success" => false,
      "message" => "Method not allowed"
   ]);

   exit;
}


try {


   /* =========================================
       GET STATISTICS
    ========================================= */

   $statsQuery = $pdo->query("

        SELECT

            COUNT(*) AS total,

            SUM(
                CASE
                    WHEN status = 'NEW'
                    THEN 1
                    ELSE 0
                END
            ) AS new_request,

            SUM(
                CASE
                    WHEN status = 'CONTACTED'
                    THEN 1
                    ELSE 0
                END
            ) AS contacted,

            SUM(
                CASE
                    WHEN status = 'DEMO_SCHEDULED'
                    THEN 1
                    ELSE 0
                END
            ) AS scheduled,

            SUM(
                CASE
                    WHEN DATE(created_at) = CURDATE()
                    THEN 1
                    ELSE 0
                END
            ) AS today

        FROM demo_requests

    ");


   $stats = $statsQuery->fetch();


   /* =========================================
       GET REQUEST DATA
    ========================================= */

   $sql = "

        SELECT

            id,

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

            location_captured_at,

            status,

            created_at

        FROM demo_requests

        ORDER BY created_at DESC

    ";


   $stmt = $pdo->query($sql);

   $requests = $stmt->fetchAll();


   /* =========================================
       SUCCESS RESPONSE
    ========================================= */

   echo json_encode([

      "success" => true,

      "message" => "Data berhasil diambil",

      "stats" => [

         "total" =>
         (int) ($stats["total"] ?? 0),

         "new" =>
         (int) ($stats["new_request"] ?? 0),

         "contacted" =>
         (int) ($stats["contacted"] ?? 0),

         "scheduled" =>
         (int) ($stats["scheduled"] ?? 0),

         "today" =>
         (int) ($stats["today"] ?? 0)

      ],

      "data" => $requests

   ]);
} catch (PDOException $e) {


   http_response_code(500);


   echo json_encode([

      "success" => false,

      "message" => "Gagal mengambil data request demo",

      "error" => $e->getMessage()

   ]);
}
