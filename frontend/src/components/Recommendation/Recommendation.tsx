import { useState, useEffect } from 'react'
import Card from './Card/'
import { User } from '@/types/types'

const API_ADDRESS = 'http://localhost:9999/api'

const Recommendation = (props: User) => {
  const { favorites, id } = props

  const [recommendations, setRecommendations] = useState<{ data: any[] }>({
    data: [],
  })

  useEffect(() => {
    fetch(`${API_ADDRESS}/user/similar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ favorites: favorites }),
    })
      .then((res) => res.json())
      .then((data) => {
        setRecommendations(data)
      })
  }, [id, favorites])

  return (
    <div className="p-4">
      <div className="flex flex-col">
        <p className="font-bold text-lg text-black">
          Based on your favorites, we recommend the following movies:
        </p>
      </div>
      <div className="carousel w-full">
        {recommendations?.data?.map((recommendation, id) => (
          <Card
            key={id}
            id={id}
            title={recommendation._source.title}
            extract={recommendation._source.extract}
          />
        ))}
      </div>
    </div>
  )
}

export default Recommendation
