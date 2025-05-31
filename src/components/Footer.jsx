import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-center text-sm text-gray-600 py-4 mt-10 border-t">
      <p className="text-sm text-gray-600">
        © {new Date().getFullYear()} My Series Log. Icons by{" "}
        <a target="_blank" rel="nofollow" href="https://icons8.com">
          Icons8
        </a>
      </p>
    </footer>
  );
}
