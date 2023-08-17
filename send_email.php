
<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $name = $_POST["name"];
  $email = $_POST["email"];
  $message = $_POST["message"];
  $to = "godsprideschools2004@gmail.com"; // Change to the desired email address
  $subject = "New Contact Form Submission";

  $headers = "From: $email\r\n";
  $headers .= "Reply-To: $email\r\n";
  $headers .= "Content-Type: text/html\r\n";

  mail($to, $subject, $message, $headers);
}
?>

