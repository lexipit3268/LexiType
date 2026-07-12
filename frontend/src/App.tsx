import { Button } from "@/components/ui/button";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-card border-4 border-border p-8 shadow-xl max-w-lg w-full text-center mb-8">
        <h1 className="text-4xl uppercase mb-4 tracking-tighter">LexiType</h1>
        <p className="text-lg font-bold mb-6">
          Thử thách gõ phím từ vựng phong cách Retro!
        </p>
      </div>

      <Button size="lg" className="font-sans!">
        Bắt đầu thử thách
      </Button>
    </div>
  );
}

export default App;
