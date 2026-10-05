"use client";

// Footer me "Install app" link. Footer server component hai (lib/tracks `fs`
// use karta hai), isliye onClick handler ke liye ye chhota client component
// alag se hai. Click par PwaInstall ko ek custom event bhejte hain -- wahi
// asli install prompt (ya iOS instructions) dikhata hai.
export default function InstallLink() {
  const onClick = (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("pwa:install-request"));
  };

  return (
    <a href="#" onClick={onClick}>
      Install app
    </a>
  );
}
