import * as Linking from 'expo-linking';

export function openYoutubeVideo(youtubeId: string) {
  const appUrl = `vnd.youtube://${youtubeId}`;
  const webUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
  Linking.openURL(appUrl).catch(() => {
    Linking.openURL(webUrl);
  });
}
