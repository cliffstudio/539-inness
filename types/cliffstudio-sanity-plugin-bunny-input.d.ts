declare module '@cliffstudio/sanity-plugin-bunny-input' {
  import type { Plugin } from 'sanity'

  export interface BunnyInputPluginOptions {
    libraryId: string
    cdnHostname: string
    apiKey: string
    collectionName: string
  }

  export function bunnyInput(options: BunnyInputPluginOptions): Plugin
  export function getMp4Url(value: unknown): string
  export function getPlaybackUrl(value: unknown): string
  export function getThumbnailUrl(value: unknown): string
}
