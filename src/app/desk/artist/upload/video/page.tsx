import type { ReactNode } from "react";
import { Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type StepProps = {
  number: number;
  title: string;
  active?: boolean;
};

function Step({ number, title, active = false }: StepProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${active ? "bg-green-500 text-black" : "bg-zinc-800 text-zinc-400"}`}>
        {number}
      </div>
      <p className={active ? "text-white" : "text-zinc-400"}>{title}</p>
    </div>
  );
}

type UploadLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function UploadLayout({ title, description, children }: UploadLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white p-6 pt-[100px]">
      <header className="max-w-4xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-green-500">{title}</h1>
        <p className="text-zinc-400 mt-2">{description}</p>
      </header>
      <main className="max-w-4xl mx-auto">{children}</main>
    </div>
  );
}

export default function VideoUploadPage() {
  return (
    <UploadLayout
      title="Upload Music Video"
      description="Upload and distribute your video to global platforms"
    >
      <div className="flex gap-8 mb-10">
        <Step number={1} title="Video" active />
        <Step number={2} title="Details" active={false} />
        <Step number={3} title="Submit" active={false} />
      </div>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-8">
          <div className="border border-dashed border-zinc-700 rounded-xl p-10 text-center">
            <Video size={40} className="text-green-500 mx-auto mb-3" />
            <p className="font-semibold">Upload Video File</p>
            <p className="text-xs text-zinc-400">MP4, MOV • Max 4GB</p>
          </div>
          <Button className="mt-8 bg-green-500 text-black hover:bg-green-400">Next</Button>
        </CardContent>
      </Card>
    </UploadLayout>
  );
}
