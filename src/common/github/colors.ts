
import metadata from '../../meta-data/github-lang-color.json'

type LanguageColor = {
  name: string
  color: string
  url: string
}

const DEFAULT_COLOR = 'gray'

export const languageColor = (lang: string): LanguageColor => {

  // @ts-ignore
  const c = metadata[lang]
  if (!c) {
    return {
      name: lang,
      color: DEFAULT_COLOR,
      url: `https://github.com/trending?l=${lang.replace(/ /g, "-")}`
    }
  }

  const d: LanguageColor = { ...c }
  if (!d.color) d.color = DEFAULT_COLOR
  d.name = lang
  return d
}
