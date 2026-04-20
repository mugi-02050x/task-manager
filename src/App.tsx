import Header from "./components/Header/Header";
import TaskTree from "./components/TaskTree/TaskTree";
import { TaskProvider } from "./contexts/TaskContext";
import { TimerProvider } from "./contexts/TimerContext";

function App() {
  return (
    <TaskProvider>
      <TimerProvider>
        <div className="min-h-screen">
          <Header />
          <main className="mx-auto w-full max-w-5xl px-3 py-4 md:px-6 md:py-8">
            <TaskTree />
          </main>
        </div>
      </TimerProvider>
    </TaskProvider>
  );
}

export default App;
