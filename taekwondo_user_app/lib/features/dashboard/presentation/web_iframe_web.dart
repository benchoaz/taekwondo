import 'package:flutter/foundation.dart';
import 'dart:html' as html;
import 'dart:ui_web' as ui_web;
import 'dart:convert';

// Menyimpan viewType yang sudah terdaftar agar tidak double-register
final _registeredViewTypes = <String>{};

// Menyimpan satu callback per videoId agar onMessage hanya perlu satu listener global
final _videoEndedCallbacks = <String, void Function()>{};
bool _globalListenerAttached = false;

void _attachGlobalListener() {
  if (_globalListenerAttached) return;
  _globalListenerAttached = true;

  html.window.onMessage.listen((event) {
    try {
      if (event.data != null && event.data is String) {
        final data = jsonDecode(event.data as String);
        if (data['event'] == 'infoDelivery' &&
            data['info'] != null &&
            data['info']['playerState'] == 0) {
          // Panggil semua callback yang terdaftar (video ended)
          for (final cb in _videoEndedCallbacks.values) {
            cb();
          }
        }
      }
    } catch (_) {
      // Abaikan parsing error dari postMessage sumber lain
    }
  });
}

void registerYoutubeIframe(String videoId, {required void Function() onVideoEnded}) {
  if (!kIsWeb) return;

  // Simpan/update callback untuk videoId ini
  _videoEndedCallbacks[videoId] = onVideoEnded;

  // Pasang global listener hanya sekali
  _attachGlobalListener();

  // Daftarkan view factory hanya jika belum pernah terdaftar
  final viewType = 'youtube-web-$videoId';
  if (_registeredViewTypes.contains(viewType)) return;
  _registeredViewTypes.add(viewType);

  ui_web.platformViewRegistry.registerViewFactory(
    viewType,
    (int viewId) {
      final iframe = html.IFrameElement()
        ..src = 'https://www.youtube.com/embed/$videoId?enablejsapi=1&origin=${html.window.location.origin}'
        ..id = 'iframe-$videoId'
        ..style.border = 'none'
        ..style.width = '100%'
        ..style.height = '100%'
        ..allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      return iframe;
    },
  );
}

void unregisterYoutubeIframe(String videoId) {
  _videoEndedCallbacks.remove(videoId);
}
