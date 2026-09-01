<?php

header("Content-Type: application/json; charset=UTF-8");

/* =========================================
   START SESSION
========================================= */

session_start();


/* =========================================
   CHECK LOGIN SESSION
========================================= */

if (
    isset($_SESSION["admin_logged_in"]) &&
    $_SESSION["admin_logged_in"] === true
) {

    echo json_encode([
        "success" => true,
        "logged_in" => true,
        "data" => [
            "id" => $_SESSION["admin_id"] ?? null,
            "name" => $_SESSION["admin_name"] ?? null,
            "username" => $_SESSION["admin_username"] ?? null,
            "role" => $_SESSION["admin_role"] ?? null
        ]
    ]);

    exit;
}


/* =========================================
   NOT LOGGED IN
========================================= */

echo json_encode([
    "success" => true,
    "logged_in" => false
]);

exit;