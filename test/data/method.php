<?php

/**
 * DEPRECATED. See server.js in the root path for further details.
 */

header("Content-type: application/json");
echo json_encode(
  array(
    "method" => sizeOf($_POST) ? "post" : "get"
  )
);
?>
