import Link from "next/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Zap, FileText } from "lucide-react";

export default async function Home() {
  const { isAuthenticated } = getKindeServerSession();
  
  if (await isAuthenticated()) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-background/30 backdrop-blur-sm fixed w-full z-50">
        <Link className="flex items-center justify-center font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent" href="#">
          ReportAway
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" asChild>
            <Link href="/api/auth/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/api/auth/register">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 pt-14">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex items-center justify-center bg-gradient-to-b from-white to-slate-100 dark:from-slate-950 dark:to-slate-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Fight Traffic Tickets with AI
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Upload your report, get instant analysis, and find out how to challenge it using advanced AI assessment.
                </p>
              </div>
              <div className="space-x-4">
                <Button className="h-11 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all" size="lg" asChild>
                   <Link href="/api/auth/register">
                    Start Your Case <ArrowRight className="ml-2 h-4 w-4" />
                   </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border hover:border-blue-500/50 transition-colors">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Instant Extraction</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Our Vision AI reads handwritten and printed ticket details in seconds.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border hover:border-indigo-500/50 transition-colors">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Smart Assessment</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Receive a detailed breakdown of your challenge options based on traffic laws.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border hover:border-purple-500/50 transition-colors">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">AI Case Chat</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Chat with an AI assistant that understands your specific case details.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t font-light text-sm text-gray-500">
        <p>© 2026 ReportAway. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
