import "./App.css";
import Header from "./components/Header/Header";
import TaskTree from "./components/TaskTree/TaskTree";
import { TaskProvider } from "./contexts/TaskContext";
import { TimerProvider } from "./contexts/TimerContext";

function App() {
  return (
    <>
      <TaskProvider>
        <TimerProvider>
          {
            <>
              <Header />
              <main className="max-w-3xl mx-auto px-4 py-6">
                <TaskTree />
              </main>
            </>
          }
        </TimerProvider>
      </TaskProvider>
    </>
  );
}

export default App;
