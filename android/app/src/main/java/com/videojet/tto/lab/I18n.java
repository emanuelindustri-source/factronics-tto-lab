package com.videojet.tto.lab;

import android.content.Context;
import org.json.JSONObject;

public final class I18n {
    private static JSONObject ui = new JSONObject();

    private I18n() {}

    public static void load(Context ctx) throws Exception {
        ui = new JSONObject(Bank.readAsset(ctx, "ui.json"));
    }

    public static String t(String key, String lang) {
        JSONObject d = ui.optJSONObject(lang);
        if (d == null) d = ui.optJSONObject("es");
        String s = d == null ? "" : d.optString(key, "");
        if (s.isEmpty()) {
            JSONObject es = ui.optJSONObject("es");
            if (es != null) s = es.optString(key, key);
        }
        return s;
    }
}
