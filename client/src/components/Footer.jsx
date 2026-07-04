export default function Footer() {
  return (
    <footer className="bg-primary-dark dark:bg-gray-900 text-white py-4 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-2 md:mb-0">ESP8266 Weather Station © {new Date().getFullYear()}</div>
        <div className="text-sm opacity-75">Made with ❤️ for IoT enthusiasts</div>
      </div>
    </footer>
  );
} 