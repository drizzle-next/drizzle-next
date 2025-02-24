export function DocsFooter() {
  return (
    <footer className="w-full border-t border-primary-300 p-5 dark:border-primary-700">
      <div className="container mx-auto flex h-14 flex-col items-center justify-center font-semibold text-muted-700 dark:text-muted-300">
        <p>Released under the MIT license.</p>
        <p>
          Copyright &copy; 2025 - present{" "}
          <a href="https://x.com/TravisLuong" className="font-bold underline">
            Travis Luong
          </a>
        </p>
      </div>
    </footer>
  );
}
