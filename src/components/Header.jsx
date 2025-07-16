export default function Header() {
  return (
    <div className="flex items-center space-x-0">
      <img src="./crab.svg" alt="Crabby Weather Logo" className="h-28 w-auto" />
      <h1 className="text-4xl font-bold  mt-4' text-slate-800 dark:text-slate-200 mb-6">
        Crabby weather
      </h1>
    </div>
  );
}
