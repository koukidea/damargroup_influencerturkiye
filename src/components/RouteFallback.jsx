// Rota parçası indirilirken Suspense'in gösterdiği içerik.
//
// Yükseklik baştan rezerve ediliyor: aksi halde parça inerken sayfa kısalıp
// uzar, footer yukarı zıplardı. Dönen gösterge ise 250 ms gecikmeyle beliriyor
// — parçalar önbellekteyken geçiş birkaç on milisaniye sürüyor ve anında
// görünen bir gösterge, yüklemeyi hızlandırmak yerine göz kırpması gibi
// algılanıyor.
export default function RouteFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-live="polite">
      <span className="route-fallback-spinner">
        <span className="block w-8 h-8 rounded-full border-2 border-gray-200 border-t-red-600 animate-spin" />
        <span className="sr-only">Yükleniyor…</span>
      </span>
    </div>
  )
}
