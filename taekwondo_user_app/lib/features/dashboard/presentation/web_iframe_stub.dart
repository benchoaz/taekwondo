// Stub untuk platform Mobile (non-web) — tidak melakukan apa-apa

void registerYoutubeIframe(String videoId, {required void Function() onVideoEnded}) {
  // No-op on mobile platforms - player ditangani oleh YoutubePlayer widget
}

void unregisterYoutubeIframe(String videoId) {
  // No-op on mobile platforms
}
