package com.factronics.tto.lab;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/** Lightweight update check against the public version.json file on GitHub. */
public final class UpdateChecker {
    public static final String VERSION_URL =
            "https://raw.githubusercontent.com/emanuelindustri-source/factronics-tto-lab/main/version.json";

    public static final class Info {
        public String version = "";
        public int code = 0;
        public String notes = "";
        public String apk = "";
        public String release = "";
    }

    public interface Callback {
        void done(Info info);
    }

    private UpdateChecker() {}

    public static void check(Context context, Callback callback) {
        final Handler handler = new Handler(Looper.getMainLooper());
        new Thread(() -> {
            Info info = null;
            HttpURLConnection connection = null;
            try {
                URL url = new URL(VERSION_URL);
                connection = (HttpURLConnection) url.openConnection();
                connection.setConnectTimeout(8000);
                connection.setReadTimeout(8000);
                connection.setRequestProperty("User-Agent", "Factronics-TTO-Lab-Android");
                connection.setRequestProperty("Cache-Control", "no-cache");
                if (connection.getResponseCode() == 200) {
                    InputStream in = connection.getInputStream();
                    BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8));
                    StringBuilder body = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) body.append(line).append('\n');
                    reader.close();
                    JSONObject object = new JSONObject(body.toString());
                    info = new Info();
                    info.version = object.optString("version", "");
                    info.code = object.optInt("versionCode", 0);
                    info.notes = object.optString("notes", "");
                    info.apk = object.optString("apk", "");
                    info.release = object.optString("release", "");
                }
            } catch (Exception ignored) {
                info = null;
            } finally {
                if (connection != null) connection.disconnect();
            }
            final Info result = info;
            handler.post(() -> callback.done(result));
        }, "tto-update-check").start();
    }
}
