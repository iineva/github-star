import Datastore from 'nedb-promises'

export const DB = {
  stars: Datastore.create({ filename: 'github-star/stars', autoload: true }),
  tags: Datastore.create({ filename: 'github-star/tags', autoload: true }),
}

export default DB
