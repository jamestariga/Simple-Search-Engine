import { CardProps } from '@/types/types'

const Card = (props: CardProps) => {
  const { title, extract, id } = props
  return (
    <div id={id.toString()} className="carousel-item relative w-full">
      <div className="card p-4 shadow-xl bg-slate-100 m-4">
        <h4 className="font-bold text-slate-900 text-xl">{title}</h4>
        <p className="">{extract}</p>
        <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
          <a href={`#${(id - 1).toString()}`} className="btn glass btn-circle">
            ❮
          </a>
          <a href={`#${(id + 1).toString()}`} className="btn glass btn-circle">
            ❯
          </a>
        </div>
      </div>
    </div>
  )
}

export default Card
