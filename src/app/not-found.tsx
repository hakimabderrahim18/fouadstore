import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 font-extrabold text-2xl">
        404
      </div>
      <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Page non trouvée</h2>
      <p className="text-slate-500 mb-6 text-sm">
        La page ou le produit que vous recherchez n&apos;existe pas ou a été déplacé.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour à l&apos;accueil</span>
      </Link>
    </div>
  );
}
