export function PageTitle({ index, title, description }: { index: string; title: string; description: string }) {
  return <header className="page-title"><p className="eyebrow">{index}</p><h1>{title}</h1><p>{description}</p></header>
}
