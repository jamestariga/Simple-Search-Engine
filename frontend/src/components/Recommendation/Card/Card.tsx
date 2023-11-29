import { CardProps } from '@/types/types'

const Card = (props: CardProps) => {
  const { title, extract } = props
  return (
    <div className="carousel-item relative w-full">
      <div className="card p-4 shadow-xl bg-slate-100 m-4">
        <h4 className="font-bold text-slate-900 text-xl">{title}</h4>
        <p>{extract}</p>
      </div>
    </div>
  )
}

export default Card
