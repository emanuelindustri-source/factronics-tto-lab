package com.videojet.tto.lab;

import android.content.Context;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class Bank {
    public static final List<Question> QUESTIONS = new ArrayList<>();
    public static final Map<String, ModelInfo> MODELS = new LinkedHashMap<>();

    private Bank() {}

    public static void load(Context ctx) throws Exception {
        QUESTIONS.clear();
        MODELS.clear();
        JSONObject root = new JSONObject(readAsset(ctx, "bank.json"));
        JSONObject models = root.getJSONObject("models");
        for (java.util.Iterator<String> it = models.keys(); it.hasNext(); ) {
            String id = it.next();
            MODELS.put(id, ModelInfo.fromJson(id, models.getJSONObject(id)));
        }
        JSONArray arr = root.getJSONArray("questions");
        for (int i = 0; i < arr.length(); i++) {
            QUESTIONS.add(Question.fromJson(arr.getJSONObject(i)));
        }
    }

    public static String readAsset(Context ctx, String name) throws Exception {
        InputStream in = ctx.getAssets().open(name);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buf = new byte[8192];
        int n;
        while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
        in.close();
        return new String(out.toByteArray(), StandardCharsets.UTF_8);
    }

    public static class ModelInfo {
        public String id, name, tier, air;
        public int ppm, ppm107, ribbon, speedCont, maxWidth;
        public double screen;
        public boolean ethernet;
        public int[] widths = new int[0];

        static ModelInfo fromJson(String id, JSONObject o) {
            ModelInfo m = new ModelInfo();
            m.id = id;
            m.name = o.optString("name", id);
            m.tier = o.optString("tier", "legacy");
            m.air = o.optString("air", "");
            m.ppm = o.optInt("ppm", 0);
            m.ppm107 = o.optInt("ppm107", 0);
            m.ribbon = o.optInt("ribbon", 0);
            m.speedCont = o.optInt("speedCont", 0);
            m.maxWidth = o.optInt("maxWidth", 0);
            m.screen = o.optDouble("screen", 0);
            m.ethernet = o.optBoolean("ethernet", false);
            JSONArray w = o.optJSONArray("widths");
            if (w != null) {
                m.widths = new int[w.length()];
                for (int i = 0; i < w.length(); i++) m.widths[i] = w.optInt(i);
            }
            return m;
        }
        public String specLine() {
            String w = widths.length > 1 ? widths[0] + "/" + widths[1] : String.valueOf(maxWidth);
            return w + " mm · " + ppm + " ppm · " + ribbon + " m";
        }
    }

    public static class Question {
        public String id, type, source;
        public List<String> models = new ArrayList<>();
        public JSONObject i18n = new JSONObject();

        static Question fromJson(JSONObject o) {
            Question q = new Question();
            q.id = o.optString("id");
            q.type = o.optString("type");
            q.source = o.optString("source");
            JSONArray ma = o.optJSONArray("models");
            if (ma != null) for (int i = 0; i < ma.length(); i++) q.models.add(ma.optString(i));
            q.i18n = o.optJSONObject("i18n");
            if (q.i18n == null) q.i18n = new JSONObject();
            return q;
        }

        public JSONObject d(String lang) {
            JSONObject d = i18n.optJSONObject(lang);
            if (d == null) d = i18n.optJSONObject("es");
            return d == null ? new JSONObject() : d;
        }
        public String text(String lang) { return d(lang).optString("q", ""); }
        public String explanation(String lang) { return d(lang).optString("explanation", ""); }
        public String modelAnswer(String lang) { return d(lang).optString("model", ""); }

        public List<Option> options(String lang) {
            List<Option> out = new ArrayList<>();
            JSONArray a = d(lang).optJSONArray("options");
            if (a != null) for (int i = 0; i < a.length(); i++) {
                JSONObject o = a.optJSONObject(i);
                if (o != null) out.add(new Option(o.optString("id"), o.optString("text")));
            }
            return out;
        }
        public List<String> answer(String lang) {
            List<String> out = new ArrayList<>();
            JSONArray a = d(lang).optJSONArray("answer");
            if (a != null) for (int i = 0; i < a.length(); i++) out.add(a.optString(i));
            return out;
        }
        public List<Field> fields(String lang) {
            List<Field> out = new ArrayList<>();
            JSONArray a = d(lang).optJSONArray("fields");
            if (a != null) for (int i = 0; i < a.length(); i++) {
                JSONObject o = a.optJSONObject(i);
                if (o != null) out.add(Field.fromJson(o));
            }
            return out;
        }
        public List<String> rubric(String lang) {
            List<String> out = new ArrayList<>();
            JSONArray a = d(lang).optJSONArray("rubric");
            if (a != null) for (int i = 0; i < a.length(); i++) out.add(a.optString(i));
            return out;
        }
        public boolean isOpen() { return "describe".equals(type) || "errorfix".equals(type); }
        public boolean isChoice() { return "single".equals(type) || "multi".equals(type) || "errmap".equals(type); }
    }

    public static class Option {
        public final String id, text;
        Option(String id, String text) { this.id = id; this.text = text; }
    }

    public static class Field {
        public String label = "", unit = "";
        public double tolerance;
        public List<Object> answers = new ArrayList<>();

        static Field fromJson(JSONObject o) {
            Field f = new Field();
            f.label = o.optString("label", "");
            f.unit = o.optString("unit", "");
            f.tolerance = o.optDouble("tolerance", 0);
            JSONArray a = o.optJSONArray("answers");
            if (a != null) for (int i = 0; i < a.length(); i++) f.answers.add(a.opt(i));
            return f;
        }
    }
}
