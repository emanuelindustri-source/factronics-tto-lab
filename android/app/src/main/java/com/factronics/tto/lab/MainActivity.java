package com.factronics.tto.lab;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.ColorStateList;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.HorizontalScrollView;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import com.factronics.tto.lab.Bank.Question;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.Set;

public class MainActivity extends Activity {
    private int BG;
    private int CARD;
    private int SOFT;
    private int INK;
    private int INK2;
    private int MUT;
    private int LINE;
    private int BRAND;
    private int CYAN;
    private int OK;
    private int BAD;
    private int WARN;
    private static final int WHITE = 0xFFFFFFFF;
    private int AMBER_BG;
    private int OK_BG;
    private int BAD_BG;

    private static final String[] MODEL_ORDER = {"6210", "6230", "6320", "6330", "6420", "6530"};
    private static final String[] TYPE_ORDER = {"single", "multi", "fill", "describe", "calc", "errmap", "errorfix"};
    private static final String[] TYPE_KEYS = {"type_single", "type_multi", "type_fill", "type_describe", "type_calc", "type_errmap", "type_errorfix"};
    private static final int[] COUNTS = {10, 15, 20, 25, 30, 40, 50};
    private static final int[] DURATIONS = {10, 20, 30, 45, 60, 90, 0};
    private static final long DAY = 86400000L;
    private static final int REQ_IMPORT = 401;

    private enum Screen { SETUP, EXAM, RESULTS }

    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable ticker;
    private Bitmap logo;
    private SharedPreferences prefs;
    private String lang = "es";
    private final Set<String> selModels = new LinkedHashSet<>();
    private final Set<String> selTypes = new LinkedHashSet<>();
    private int count = 20;
    private int minutes = 30;
    private boolean partial = true;
    private boolean unseen = true;
    private boolean dark = false;
    private String mode = "exam";
    private final Map<String, Integer> seen = new HashMap<>();
    private Screen screen = Screen.SETUP;
    private Exam exam;
    private int reviewFilter = 0;
    private JSONObject progressData;
    private String pendingImport = null;

    private TextView poolView;
    private TextView timerView;
    private TextView qCountView;
    private ProgressBar progress;
    private LinearLayout paletteRow;
    private LinearLayout qCard;
    private Button prevButton;
    private Button nextButton;
    private Button flagButton;
    private ScrollView resultScroll;
    private int restoreScrollY = -1;
    private final List<Button> paletteButtons = new ArrayList<>();

    private static class Exam {
        List<Question> qs = new ArrayList<>();
        Map<String, Object> answers = new HashMap<>();
        Set<String> flags = new HashSet<>();
        Map<String, Double> self = new HashMap<>();
        Map<String, String> errorSnapshot = new HashMap<>();
        int index = 0;
        long startedAt, endsAt, finishedAt;
        boolean submitted;
        String id = "";
        String mode = "exam";
        String attemptId = null;
        boolean instant = false;
    }

    private static class Row {
        Question q;
        Object answer;
        Double grade;
        String status;
    }

    private static class Result {
        double points;
        int total;
        int pending;
        int ok;
        int bad;
        int blank;
        List<Row> rows = new ArrayList<>();
        Map<String, double[]> byType = new LinkedHashMap<>();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences("tto", MODE_PRIVATE);
        applyTheme();
        try {
            Bank.load(this);
            I18n.load(this);
            logo = BitmapFactory.decodeStream(getAssets().open("logo.png"));
        } catch (Exception e) {
            Toast.makeText(this, "Bank error: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
        lang = prefs.getString("lang", "es");
        if (!"es".equals(lang) && !"en".equals(lang) && !"pt".equals(lang)) lang = "es";
        loadConfig();
        loadProgress();
        showSetup();
    }

    private void applyTheme() {
        boolean systemDark = (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK)
                == Configuration.UI_MODE_NIGHT_YES;
        dark = prefs.contains("dark") ? prefs.getBoolean("dark", false) : systemDark;
        if (dark) {
            BG = 0xFF07131F;
            CARD = 0xFF0E2234;
            SOFT = 0xFF132F47;
            INK = 0xFFEAF4FC;
            INK2 = 0xFFB7CBDD;
            MUT = 0xFF89A3B9;
            LINE = 0xFF244157;
            BRAND = 0xFF2D8CFF;
            CYAN = 0xFF34C2FF;
            OK = 0xFF5CD6A9;
            BAD = 0xFFFF8A80;
            WARN = 0xFFFFC46B;
            AMBER_BG = 0xFF3B2A12;
            OK_BG = 0xFF11382B;
            BAD_BG = 0xFF3A1B1B;
        } else {
            BG = 0xFFF3F7FB;
            CARD = 0xFFFFFFFF;
            SOFT = 0xFFE6F2FB;
            INK = 0xFF0A1B2C;
            INK2 = 0xFF2F465C;
            MUT = 0xFF647D93;
            LINE = 0xFFD8E4EF;
            BRAND = 0xFF0B5CAB;
            CYAN = 0xFF00A3E0;
            OK = 0xFF0B7A58;
            BAD = 0xFFB3261E;
            WARN = 0xFFA35A00;
            AMBER_BG = 0xFFFFF2DC;
            OK_BG = 0xFFE3F6EE;
            BAD_BG = 0xFFFDECEB;
        }
        getWindow().setStatusBarColor(BRAND);
        getWindow().setNavigationBarColor(BG);
    }

    private void refreshScreen() {
        if (screen == Screen.EXAM) showExam();
        else if (screen == Screen.RESULTS) showResults();
        else showSetup();
    }

    private void toggleTheme() {
        dark = !dark;
        prefs.edit().putBoolean("dark", dark).apply();
        applyTheme();
        refreshScreen();
    }

    /* ------------------------------------------------------------ config */
    private void loadConfig() {
        for (String m : MODEL_ORDER) {
            if (Bank.MODELS.containsKey(m)) selModels.add(m);
        }
        String ms = prefs.getString("models", "");
        if (!ms.isEmpty()) {
            Set<String> tmp = new LinkedHashSet<>();
            for (String m : ms.split(",")) if (Bank.MODELS.containsKey(m)) tmp.add(m);
            if (!tmp.isEmpty()) {
                selModels.clear();
                selModels.addAll(tmp);
            }
        }
        String ts = prefs.getString("types", "");
        if (!ts.isEmpty()) {
            Set<String> tmp = new LinkedHashSet<>();
            for (String t : ts.split(",")) if (contains(TYPE_ORDER, t)) tmp.add(t);
            if (!tmp.isEmpty()) {
                selTypes.clear();
                selTypes.addAll(tmp);
            }
        } else {
            Collections.addAll(selTypes, TYPE_ORDER);
        }
        count = Math.max(5, Math.min(100, prefs.getInt("count", 20)));
        minutes = prefs.getInt("minutes", 30);
        if (!contains(DURATIONS, minutes)) minutes = 30;
        partial = prefs.getBoolean("partial", true);
        unseen = prefs.getBoolean("unseen", true);
        mode = prefs.getString("mode", "exam");
        if (!"exam".equals(mode) && !"study".equals(mode) && !"review".equals(mode)) mode = "exam";
        try {
            JSONObject o = new JSONObject(prefs.getString("seen", "{}"));
            for (Iterator<String> it = o.keys(); it.hasNext(); ) {
                String k = it.next();
                seen.put(k, o.optInt(k, 0));
            }
        } catch (Exception ignored) {}
    }

    private void saveConfig() {
        prefs.edit()
                .putString("models", join(selModels, ","))
                .putString("types", join(selTypes, ","))
                .putInt("count", count)
                .putInt("minutes", minutes)
                .putBoolean("partial", partial)
                .putBoolean("unseen", unseen)
                .putString("mode", mode)
                .apply();
    }

    private void saveSeen() {
        JSONObject o = new JSONObject();
        try {
            for (Map.Entry<String, Integer> e : seen.entrySet()) o.put(e.getKey(), e.getValue());
        } catch (Exception ignored) {}
        prefs.edit().putString("seen", o.toString()).apply();
    }

    /* --------------------------------------------------------------- i18n */
    private String t(String key) { return I18n.t(key, lang); }
    private String typeLabel(String type) {
        for (int i = 0; i < TYPE_ORDER.length; i++) if (TYPE_ORDER[i].equals(type)) return t(TYPE_KEYS[i]);
        return type;
    }
    private String modeLabel(String m) {
        return t("study".equals(m) ? "mode_study" : "review".equals(m) ? "mode_review" : "mode_exam");
    }
    private String langName() { return "es".equals(lang) ? "ES" : "en".equals(lang) ? "EN" : "PT"; }
    private void setLang(String l) {
        if (!"es".equals(l) && !"en".equals(l) && !"pt".equals(l)) return;
        lang = l;
        prefs.edit().putString("lang", l).apply();
        if (screen == Screen.EXAM) showExam();
        else if (screen == Screen.RESULTS) showResults();
        else showSetup();
    }

    /* --------------------------------------------------------------- pool */
    private List<Question> pool() {
        List<Question> out = new ArrayList<>();
        Set<String> used = new HashSet<>();
        for (Question q : Bank.QUESTIONS) {
            if (!selTypes.contains(q.type)) continue;
            boolean modelOk = false;
            for (String m : q.models) if (selModels.contains(m)) { modelOk = true; break; }
            if (!modelOk) continue;
            String key = norm(q.text(lang));
            if (used.add(key)) out.add(q);
        }
        return out;
    }

    private List<Question> poolForType(String type) {
        List<Question> out = new ArrayList<>();
        Set<String> used = new HashSet<>();
        for (Question q : Bank.QUESTIONS) {
            if (!type.equals(q.type)) continue;
            boolean modelOk = false;
            for (String m : q.models) if (selModels.contains(m)) { modelOk = true; break; }
            if (!modelOk) continue;
            if (used.add(norm(q.text(lang)))) out.add(q);
        }
        return out;
    }

    private int unseenCount(List<Question> list) {
        int n = 0;
        for (Question q : list) if (!seen.containsKey(q.id) || seen.get(q.id) == 0) n++;
        return n;
    }

    private List<Question> pick(List<Question> source, int wanted) {
        List<List<Question>> buckets = new ArrayList<>();
        for (String type : TYPE_ORDER) {
            if (!selTypes.contains(type)) continue;
            List<Question> b = new ArrayList<>();
            for (Question q : source) if (type.equals(q.type)) b.add(q);
            Collections.shuffle(b, new Random());
            if (unseen) {
                Collections.sort(b, (a, c) -> Integer.compare(
                        seen.containsKey(a.id) ? seen.get(a.id) : 0,
                        seen.containsKey(c.id) ? seen.get(c.id) : 0));
            }
            if (!b.isEmpty()) buckets.add(b);
        }
        List<Question> out = new ArrayList<>();
        while (out.size() < wanted) {
            boolean added = false;
            for (List<Question> b : buckets) {
                if (b.isEmpty()) continue;
                out.add(b.remove(0));
                added = true;
                if (out.size() >= wanted) break;
            }
            if (!added) break;
        }
        return out;
    }

    /* ------------------------------------------------------------ progress */
    private JSONObject newProgressData() {
        JSONObject root = new JSONObject();
        try {
            root.put("version", 2);
            root.put("active", "Técnico");
            JSONObject profiles = new JSONObject();
            JSONObject p = new JSONObject();
            p.put("name", "Técnico");
            p.put("createdAt", System.currentTimeMillis());
            p.put("attempts", new JSONArray());
            p.put("errors", new JSONObject());
            profiles.put("Técnico", p);
            root.put("profiles", profiles);
        } catch (Exception ignored) {}
        return root;
    }

    private void loadProgress() {
        try {
            progressData = new JSONObject(prefs.getString("progress_v2", ""));
        } catch (Exception e) {
            progressData = null;
        }
        if (progressData == null || progressData.optJSONObject("profiles") == null) {
            progressData = newProgressData();
        }
        ensureProfile();
    }

    private void ensureProfile() {
        if (progressData == null) progressData = newProgressData();
        try {
            JSONObject profiles = progressData.optJSONObject("profiles");
            if (profiles == null) {
                profiles = new JSONObject();
                progressData.put("profiles", profiles);
            }
            String active = progressData.optString("active", "Técnico");
            if (active.isEmpty()) active = "Técnico";
            JSONObject p = profiles.optJSONObject(active);
            if (p == null) {
                p = new JSONObject();
                p.put("name", active);
                p.put("createdAt", System.currentTimeMillis());
                p.put("attempts", new JSONArray());
                p.put("errors", new JSONObject());
                profiles.put(active, p);
            }
            if (p.optJSONArray("attempts") == null) p.put("attempts", new JSONArray());
            if (p.optJSONObject("errors") == null) p.put("errors", new JSONObject());
            progressData.put("active", active);
        } catch (Exception ignored) {}
    }

    private String activeName() {
        if (progressData == null) loadProgress();
        return progressData.optString("active", "Técnico");
    }

    private JSONObject profile() {
        ensureProfile();
        try {
            return progressData.getJSONObject("profiles").getJSONObject(activeName());
        } catch (Exception e) {
            return new JSONObject();
        }
    }

    private void saveProgress() {
        if (progressData == null) return;
        prefs.edit().putString("progress_v2", progressData.toString()).apply();
    }

    private JSONArray attempts() {
        JSONArray a = profile().optJSONArray("attempts");
        return a == null ? new JSONArray() : a;
    }

    private int attemptCount() { return attempts().length(); }

    private double averagePct() {
        JSONArray a = attempts();
        if (a.length() == 0) return 0;
        double total = 0;
        for (int i = 0; i < a.length(); i++) {
            JSONObject o = a.optJSONObject(i);
            if (o != null) total += o.optDouble("percent", 0);
        }
        return Math.round(total / a.length() * 10.0) / 10.0;
    }

    private double bestPct() {
        JSONArray a = attempts();
        double best = 0;
        for (int i = 0; i < a.length(); i++) {
            JSONObject o = a.optJSONObject(i);
            if (o != null) best = Math.max(best, o.optDouble("percent", 0));
        }
        return Math.round(best * 10.0) / 10.0;
    }

    private int streakDays() {
        JSONArray a = attempts();
        Set<String> days = new HashSet<>();
        SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
        for (int i = 0; i < a.length(); i++) {
            JSONObject o = a.optJSONObject(i);
            long at = o == null ? 0 : o.optLong("at", 0);
            if (at > 0) days.add(f.format(new Date(at)));
        }
        long cursor = System.currentTimeMillis();
        if (!days.contains(f.format(new Date(cursor)))) cursor -= DAY;
        int streak = 0;
        while (days.contains(f.format(new Date(cursor)))) {
            streak++;
            cursor -= DAY;
        }
        return streak;
    }

    private List<String> errorIds() {
        final JSONObject errors = profile().optJSONObject("errors");
        List<String> ids = new ArrayList<>();
        if (errors != null) {
            for (Iterator<String> it = errors.keys(); it.hasNext(); ) {
                String id = it.next();
                JSONObject e = errors.optJSONObject(id);
                if (e != null && e.optInt("count", 0) > 0) ids.add(id);
            }
        }
        Collections.sort(ids, (a, b) -> {
            JSONObject ea = errors == null ? null : errors.optJSONObject(a);
            JSONObject eb = errors == null ? null : errors.optJSONObject(b);
            int c = Integer.compare(eb == null ? 0 : eb.optInt("count", 0), ea == null ? 0 : ea.optInt("count", 0));
            if (c != 0) return c;
            return Long.compare(ea == null ? 0 : ea.optLong("due", 0), eb == null ? 0 : eb.optLong("due", 0));
        });
        return ids;
    }

    private List<String> dueIds() {
        List<String> all = errorIds();
        List<String> out = new ArrayList<>();
        JSONObject errors = profile().optJSONObject("errors");
        long now = System.currentTimeMillis();
        for (String id : all) {
            JSONObject e = errors == null ? null : errors.optJSONObject(id);
            if (e != null && e.optLong("due", 0) <= now) out.add(id);
        }
        return out;
    }

    private void applyError(String id, String status, long at) {
        try {
            JSONObject errors = profile().getJSONObject("errors");
            if ("ok".equals(status)) {
                JSONObject e = errors.optJSONObject(id);
                if (e == null) return;
                int streak = e.optInt("streak", 0) + 1;
                e.put("streak", streak);
                e.put("last", at);
                if (streak >= 2) errors.remove(id);
                else e.put("due", at + 7 * DAY);
                return;
            }
            if (!"bad".equals(status) && !"half".equals(status) && !"blank".equals(status)) return;
            JSONObject e = errors.optJSONObject(id);
            if (e == null) e = new JSONObject();
            int c = e.optInt("count", 0) + 1;
            e.put("count", c);
            e.put("streak", 0);
            e.put("last", at);
            long[] intervals = {1, 3, 7, 21, 45};
            e.put("due", at + intervals[Math.min(c - 1, intervals.length - 1)] * DAY);
            errors.put(id, e);
        } catch (Exception ignored) {}
    }

    private void syncErrors(Result r) {
        if (r == null || exam == null) return;
        long at = exam.finishedAt > 0 ? exam.finishedAt : System.currentTimeMillis();
        for (Row row : r.rows) {
            if (row == null || row.q == null) continue;
            String id = row.q.id;
            String prev = exam.errorSnapshot.get(id);
            if (row.status != null && row.status.equals(prev)) continue;
            applyError(id, row.status, at);
            if (row.status != null) exam.errorSnapshot.put(id, row.status);
        }
        if (exam.attemptId != null) updateAttempt(r);
        saveProgress();
    }

    private JSONObject findAttempt(String id) {
        JSONArray a = attempts();
        for (int i = 0; i < a.length(); i++) {
            JSONObject o = a.optJSONObject(i);
            if (o != null && id.equals(o.optString("id"))) return o;
        }
        return null;
    }

    private JSONArray wrongIds(Result r) {
        JSONArray out = new JSONArray();
        Set<String> used = new HashSet<>();
        for (Row row : r.rows) {
            if (row == null || row.q == null) continue;
            if ("bad".equals(row.status) || "half".equals(row.status) || "blank".equals(row.status)) {
                if (used.add(row.q.id)) out.put(row.q.id);
            }
        }
        return out;
    }

    private void updateAttempt(Result r) {
        JSONObject a = findAttempt(exam.attemptId);
        if (a == null) return;
        try {
            a.put("ok", r.ok);
            a.put("bad", r.bad);
            a.put("blank", r.blank);
            a.put("pending", r.pending);
            a.put("percent", Math.round((r.total == 0 ? 0 : r.points / r.total * 100) * 10.0) / 10.0);
            a.put("points", Math.round(r.points * 100.0) / 100.0);
            a.put("wrongIds", wrongIds(r));
        } catch (Exception ignored) {}
    }

    private void recordResult(Result r) {
        if (r == null || exam == null) return;
        syncErrors(r);
        if (exam.attemptId != null) return;
        long at = exam.finishedAt > 0 ? exam.finishedAt : System.currentTimeMillis();
        try {
            JSONObject a = new JSONObject();
            String id = "att-" + at + "-" + Integer.toHexString(new Random().nextInt(0xFFFF));
            a.put("id", id);
            a.put("at", at);
            a.put("duration", Math.max(0, (at - exam.startedAt) / 1000));
            a.put("percent", Math.round((r.total == 0 ? 0 : r.points / r.total * 100) * 10.0) / 10.0);
            a.put("points", Math.round(r.points * 100.0) / 100.0);
            a.put("total", r.total);
            a.put("mode", exam.mode);
            a.put("ok", r.ok);
            a.put("bad", r.bad);
            a.put("blank", r.blank);
            a.put("pending", r.pending);
            JSONArray models = new JSONArray();
            JSONArray types = new JSONArray();
            Set<String> ms = new LinkedHashSet<>();
            Set<String> ts = new LinkedHashSet<>();
            for (Question q : exam.qs) {
                ms.addAll(q.models);
                ts.add(q.type);
            }
            for (String m : ms) models.put(m);
            for (String ty : ts) types.put(ty);
            a.put("models", models);
            a.put("types", types);
            a.put("wrongIds", wrongIds(r));
            JSONArray old = attempts();
            JSONArray next = new JSONArray();
            next.put(a);
            for (int i = 0; i < old.length() && i < 59; i++) next.put(old.optJSONObject(i));
            profile().put("attempts", next);
            exam.attemptId = id;
            saveProgress();
        } catch (Exception ignored) {}
    }

    /* ------------------------------------------------------- exam persistence */
    private void saveExamState() {
        if (exam == null || exam.submitted) return;
        try {
            JSONObject o = new JSONObject();
            o.put("id", exam.id);
            o.put("startedAt", exam.startedAt);
            o.put("endsAt", exam.endsAt);
            o.put("finishedAt", exam.finishedAt);
            o.put("index", exam.index);
            o.put("mode", exam.mode);
            o.put("instant", exam.instant);
            o.put("attemptId", exam.attemptId == null ? "" : exam.attemptId);
            JSONArray qs = new JSONArray();
            JSONObject ans = new JSONObject();
            for (Question q : exam.qs) {
                qs.put(q.id);
                Object a = exam.answers.get(q.id);
                if (a instanceof Set) {
                    JSONArray arr = new JSONArray();
                    for (String s : castSet(a)) arr.put(s);
                    ans.put(q.id, arr);
                } else if (a instanceof List) {
                    JSONArray arr = new JSONArray();
                    for (String s : castList(a)) arr.put(s == null ? "" : s);
                    ans.put(q.id, arr);
                } else if (a != null) {
                    ans.put(q.id, String.valueOf(a));
                }
            }
            o.put("questions", qs);
            o.put("answers", ans);
            JSONArray flags = new JSONArray();
            for (String f : exam.flags) flags.put(f);
            o.put("flags", flags);
            JSONObject self = new JSONObject();
            for (Map.Entry<String, Double> e : exam.self.entrySet()) self.put(e.getKey(), e.getValue());
            o.put("self", self);
            JSONObject snap = new JSONObject();
            for (Map.Entry<String, String> e : exam.errorSnapshot.entrySet()) snap.put(e.getKey(), e.getValue());
            o.put("snapshot", snap);
            prefs.edit().putString("exam_state", o.toString()).apply();
        } catch (Exception ignored) {}
    }

    private boolean hasSavedExam() {
        return !prefs.getString("exam_state", "").isEmpty();
    }

    private Question questionById(String id) {
        for (Question q : Bank.QUESTIONS) if (q.id.equals(id)) return q;
        return null;
    }

    private Exam loadSavedExam() {
        try {
            JSONObject o = new JSONObject(prefs.getString("exam_state", ""));
            JSONArray qs = o.optJSONArray("questions");
            if (qs == null || qs.length() == 0) return null;
            Exam e = new Exam();
            for (int i = 0; i < qs.length(); i++) {
                Question q = questionById(qs.optString(i));
                if (q == null) return null;
                e.qs.add(q);
            }
            e.id = o.optString("id", "exam-" + System.currentTimeMillis());
            e.startedAt = o.optLong("startedAt", System.currentTimeMillis());
            e.endsAt = o.optLong("endsAt", 0);
            e.finishedAt = o.optLong("finishedAt", 0);
            e.index = Math.max(0, Math.min(e.qs.size() - 1, o.optInt("index", 0)));
            e.mode = o.optString("mode", "exam");
            e.instant = o.optBoolean("instant", false);
            String aid = o.optString("attemptId", "");
            e.attemptId = aid.isEmpty() ? null : aid;
            JSONObject ans = o.optJSONObject("answers");
            if (ans != null) {
                for (Question q : e.qs) {
                    Object raw = ans.opt(q.id);
                    if (raw == null || raw == JSONObject.NULL) continue;
                    if ("multi".equals(q.type)) {
                        Set<String> set = new LinkedHashSet<>();
                        JSONArray arr = ans.optJSONArray(q.id);
                        if (arr != null) for (int i = 0; i < arr.length(); i++) set.add(arr.optString(i));
                        e.answers.put(q.id, set);
                    } else if ("fill".equals(q.type) || "calc".equals(q.type)) {
                        List<String> list = new ArrayList<>();
                        JSONArray arr = ans.optJSONArray(q.id);
                        if (arr != null) for (int i = 0; i < arr.length(); i++) list.add(arr.optString(i));
                        e.answers.put(q.id, list);
                    } else {
                        e.answers.put(q.id, String.valueOf(raw));
                    }
                }
            }
            JSONArray flags = o.optJSONArray("flags");
            if (flags != null) for (int i = 0; i < flags.length(); i++) e.flags.add(flags.optString(i));
            JSONObject self = o.optJSONObject("self");
            if (self != null) for (Iterator<String> it = self.keys(); it.hasNext(); ) {
                String id = it.next(); e.self.put(id, self.optDouble(id));
            }
            JSONObject snap = o.optJSONObject("snapshot");
            if (snap != null) for (Iterator<String> it = snap.keys(); it.hasNext(); ) {
                String id = it.next(); e.errorSnapshot.put(id, snap.optString(id));
            }
            return e;
        } catch (Exception e) {
            return null;
        }
    }

    private void discardSavedExam() {
        prefs.edit().remove("exam_state").apply();
    }

    /* --------------------------------------------------------------- setup */
    private void showSetup() {
        screen = Screen.SETUP;
        stopTimer();
        exam = null;
        LinearLayout root = col();
        root.setBackgroundColor(BG);
        root.addView(header());
        ScrollView sv = new ScrollView(this);
        sv.setFillViewport(true);
        LinearLayout c = col();
        c.setPadding(dp(16), dp(16), dp(16), dp(28));
        c.addView(kicker(t("setup_kicker")));
        c.addView(text(t("gen_title"), 28, INK, true), top(8));
        c.addView(text(t("gen_lead_android"), 14, INK2, false), top(6));
        c.addView(text(t("credit_line"), 11, MUT, false), top(6));

        if (hasSavedExam()) c.addView(resumeCard(), top(12));
        c.addView(modeCard(), top(16));
        c.addView(modelsCard(), top(10));
        c.addView(countTimeCard(), top(10));
        c.addView(typesCard(), top(10));
        c.addView(optionsCard(), top(10));
        c.addView(progressCard(), top(10));

        LinearLayout bottom = col();
        bottom.setPadding(0, dp(12), 0, 0);
        poolView = text("", 13, MUT, false);
        bottom.addView(poolView);
        Button start = button("review".equals(mode) ? t("review_start") : t("start"), true);
        start.setTextSize(16);
        start.setOnClickListener(v -> startExam());
        bottom.addView(start, top(10, 52));
        TextView legal = text(t("legal_android"), 10, MUT, false);
        legal.setPadding(0, dp(10), 0, 0);
        bottom.addView(legal);
        c.addView(bottom);
        sv.addView(c);
        root.addView(sv, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        setContentView(root);
        updatePoolLabel();
    }

    private LinearLayout resumeCard() {
        LinearLayout card = card();
        card.setBackground(round(AMBER_BG, 14, WARN, 1));
        card.addView(text(t("resume_title"), 16, INK, true));
        card.addView(text(t("resume_text"), 12, INK2, false), top(4));
        LinearLayout r = row();
        Button cont = smallButton(t("resume_btn"));
        cont.setOnClickListener(v -> {
            Exam saved = loadSavedExam();
            if (saved == null) {
                discardSavedExam();
                toast(t("import_error"));
                showSetup();
                return;
            }
            exam = saved;
            showExam();
            startTimer();
        });
        Button discard = smallButton(t("resume_discard"));
        discard.setOnClickListener(v -> { discardSavedExam(); showSetup(); });
        r.addView(cont, weight());
        r.addView(discard, weightLeft(8));
        card.addView(r, top(10));
        return card;
    }

    private LinearLayout modeCard() {
        LinearLayout card = card();
        addCardHeader(card, t("mode_title"), t("mode_help"));
        String[] keys = {"mode_exam", "mode_study", "mode_review"};
        String[] ids = {"exam", "study", "review"};
        String[] desc = {"mode_exam_d", "mode_study_d", "mode_review_d"};
        for (int i = 0; i < ids.length; i++) {
            String m = ids[i];
            Button b = button(t(keys[i]) + "\n" + t(desc[i]), m.equals(mode));
            b.setTextSize(12);
            b.setGravity(Gravity.START | Gravity.CENTER_VERTICAL);
            b.setMinHeight(dp(58));
            b.setPadding(dp(12), dp(8), dp(12), dp(8));
            b.setOnClickListener(v -> { mode = m; saveConfig(); showSetup(); });
            card.addView(b, top(i == 0 ? 10 : 6));
        }
        if ("review".equals(mode)) card.addView(text(t("review_limit"), 11, MUT, false), top(8));
        return card;
    }

    private LinearLayout progressCard() {
        LinearLayout card = card();
        addCardHeader(card, t("progress_title"), t("progress_lead_android"));
        LinearLayout r1 = row();
        r1.addView(statBox(String.valueOf(attemptCount()), t("stat_attempts")), weight());
        r1.addView(statBox(fmt(averagePct()) + "%", t("stat_average")), weightLeft(6));
        r1.addView(statBox(fmt(bestPct()) + "%", t("stat_best")), weightLeft(6));
        card.addView(r1, top(10));
        LinearLayout r2 = row();
        r2.addView(statBox(String.valueOf(dueIds().size()), t("stat_due")), weight());
        r2.addView(statBox(String.valueOf(errorIds().size()), t("stat_errors")), weightLeft(6));
        r2.addView(statBox(String.valueOf(streakDays()), t("stat_streak")), weightLeft(6));
        card.addView(r2, top(6));

        LinearLayout actions = row();
        Button due = smallButton(t("review_due"));
        due.setOnClickListener(v -> {
            List<String> ids = dueIds();
            if (ids.isEmpty()) { toast(t("review_none")); return; }
            startReview(ids);
        });
        Button errors = smallButton(t("review_errors"));
        errors.setOnClickListener(v -> {
            List<String> ids = errorIds();
            if (ids.isEmpty()) { toast(t("review_errors_none")); return; }
            startReview(ids);
        });
        actions.addView(due, weight());
        actions.addView(errors, weightLeft(6));
        card.addView(actions, top(10));

        LinearLayout tools = row();
        Button lib = smallButton(t("library_open"));
        lib.setOnClickListener(v -> showLibrary());
        Button exp = smallButton(t("export_progress"));
        exp.setOnClickListener(v -> shareProgress());
        Button imp = smallButton(t("import_progress"));
        imp.setOnClickListener(v -> importProgress());
        tools.addView(lib, weight());
        tools.addView(exp, weightLeft(6));
        tools.addView(imp, weightLeft(6));
        card.addView(tools, top(6));

        card.addView(text(t("history_title"), 14, INK, true), top(14));
        JSONArray at = attempts();
        if (at.length() == 0) {
            card.addView(text(t("history_empty"), 12, MUT, false), top(5));
        } else {
            for (int i = 0; i < Math.min(4, at.length()); i++) {
                JSONObject a = at.optJSONObject(i);
                if (a == null) continue;
                card.addView(historyItem(a), top(6));
            }
        }
        return card;
    }

    private LinearLayout historyItem(JSONObject a) {
        LinearLayout item = col();
        item.setBackground(round(SOFT, 11, LINE, 1));
        item.setPadding(dp(10), dp(8), dp(10), dp(8));
        String date = new SimpleDateFormat("dd MMM yyyy", Locale.forLanguageTag(lang)).format(new Date(a.optLong("at", System.currentTimeMillis())));
        LinearLayout top = row();
        top.addView(text(date + " · " + modeLabel(a.optString("mode", "exam")), 12, INK, true), weight());
        String pct = fmt(a.optDouble("percent", 0)) + "%";
        top.addView(text(pct, 13, a.optDouble("percent", 0) >= 70 ? OK : BAD, true));
        item.addView(top);
        int wrong = a.optJSONArray("wrongIds") == null ? 0 : a.optJSONArray("wrongIds").length();
        String meta = a.optInt("total", 0) + " " + t("history_questions_short") + " · "
                + (wrong == 0 ? t("history_no_wrong") : wrong + " " + t("history_wrong"));
        item.addView(text(meta, 10, MUT, false), top(2));
        JSONArray ids = a.optJSONArray("wrongIds");
        if (ids != null && ids.length() > 0) {
            Button b = smallButton(t("history_review"));
            b.setOnClickListener(v -> startReview(jsonList(ids)));
            item.addView(b, top(6));
        }
        return item;
    }

    private List<String> jsonList(JSONArray arr) {
        List<String> out = new ArrayList<>();
        if (arr != null) for (int i = 0; i < arr.length(); i++) out.add(arr.optString(i));
        return out;
    }

    private void startReview(List<String> ids) {
        if (ids == null || ids.isEmpty()) { toast(t("review_none")); return; }
        List<Question> qs = new ArrayList<>();
        Set<String> used = new HashSet<>();
        for (String id : ids) {
            if (!used.add(id)) continue;
            Question q = questionById(id);
            if (q != null) qs.add(q);
            if (qs.size() >= 50) break;
        }
        if (qs.isEmpty()) { toast(t("review_none")); return; }
        exam = new Exam();
        exam.id = "exam-" + System.currentTimeMillis();
        exam.qs = qs;
        exam.startedAt = System.currentTimeMillis();
        exam.endsAt = 0;
        exam.mode = "review";
        exam.instant = true;
        exam.errorSnapshot = new HashMap<>();
        discardSavedExam();
        showExam();
        startTimer();
    }

    private void showLibrary() {
        LinearLayout box = col();
        box.setPadding(dp(14), dp(6), dp(14), dp(4));
        EditText search = new EditText(this);
        search.setHint(t("library_search"));
        search.setTextSize(14);
        search.setTextColor(INK);
        search.setSingleLine(true);
        search.setBackground(round(CARD, 9, LINE, 1));
        search.setPadding(dp(10), dp(6), dp(10), dp(6));
        box.addView(search);

        LinearLayout filters = row();
        List<String> typeLabels = new ArrayList<>();
        typeLabels.add(t("library_all"));
        for (String type : TYPE_ORDER) typeLabels.add(typeLabel(type));
        Spinner typeSp = new Spinner(this);
        ArrayAdapter<String> ta = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, typeLabels);
        ta.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        typeSp.setAdapter(ta);
        typeSp.setBackground(round(CARD, 9, LINE, 1));
        List<String> modelLabels = new ArrayList<>();
        modelLabels.add(t("library_all"));
        for (String m : MODEL_ORDER) modelLabels.add(m);
        Spinner modelSp = new Spinner(this);
        ArrayAdapter<String> ma = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, modelLabels);
        ma.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        modelSp.setAdapter(ma);
        modelSp.setBackground(round(CARD, 9, LINE, 1));
        filters.addView(typeSp, weight());
        filters.addView(modelSp, weightLeft(7));
        box.addView(filters, top(7));

        TextView count = text("", 11, MUT, true);
        box.addView(count, top(6));
        ScrollView sv = new ScrollView(this);
        LinearLayout results = col();
        sv.addView(results);
        box.addView(sv, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(420)));

        final Runnable[] render = new Runnable[1];
        render[0] = () -> {
            results.removeAllViews();
            String needle = norm(search.getText().toString());
            int typePos = typeSp.getSelectedItemPosition();
            int modelPos = modelSp.getSelectedItemPosition();
            String type = typePos > 0 ? TYPE_ORDER[typePos - 1] : "";
            String model = modelPos > 0 ? MODEL_ORDER[modelPos - 1] : "";
            List<Question> matches = new ArrayList<>();
            Set<String> used = new HashSet<>();
            for (Question q : Bank.QUESTIONS) {
                if (!type.isEmpty() && !type.equals(q.type)) continue;
                if (!model.isEmpty() && !q.models.contains(model)) continue;
                String hay = norm(q.text(lang) + " " + correctText(q) + " " + q.d(lang).optString("explanation", ""));
                if (!needle.isEmpty() && !hay.contains(needle)) continue;
                if (used.add(norm(q.text(lang)))) matches.add(q);
            }
            count.setText(matches.size() + " " + t("library_results"));
            if (matches.isEmpty()) {
                results.addView(text(t("library_no_results"), 12, MUT, false), top(8));
                return;
            }
            for (int i = 0; i < Math.min(40, matches.size()); i++) {
                Question q = matches.get(i);
                LinearLayout item = col();
                item.setBackground(round(SOFT, 10, LINE, 1));
                item.setPadding(dp(10), dp(8), dp(10), dp(8));
                item.addView(text(q.text(lang), 13, INK, true));
                item.addView(text(t("library_answer") + ": " + correctText(q), 11, OK, true), top(3));
                String ex = q.d(lang).optString("explanation", "");
                if (!ex.isEmpty()) item.addView(text(ex, 11, INK2, false), top(3));
                results.addView(item, top(6));
            }
        };
        search.addTextChangedListener(new TextWatcher() {
            public void beforeTextChanged(CharSequence s, int a, int b, int c) {}
            public void onTextChanged(CharSequence s, int a, int b, int c) {}
            public void afterTextChanged(Editable s) { render[0].run(); }
        });
        typeSp.setOnItemSelectedListener(new SimpleItemSelected(position -> render[0].run()));
        modelSp.setOnItemSelectedListener(new SimpleItemSelected(position -> render[0].run()));
        render[0].run();

        new AlertDialog.Builder(this)
                .setTitle(t("library_title"))
                .setView(box)
                .setPositiveButton(t("library_close"), null)
                .show();
    }

    private void shareProgress() {
        Intent send = new Intent(Intent.ACTION_SEND);
        send.setType("text/plain");
        send.putExtra(Intent.EXTRA_SUBJECT, "Factronics TTO Lab · Progreso");
        send.putExtra(Intent.EXTRA_TEXT, progressData == null ? "{}" : progressData.toString());
        startActivity(Intent.createChooser(send, t("export_progress")));
    }

    private void importProgress() {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        try {
            startActivityForResult(intent, REQ_IMPORT);
        } catch (Exception e) {
            toast(t("import_error"));
        }
    }

    private void mergeProgress(JSONObject imported) throws Exception {
        ensureProfile();
        JSONObject incoming = imported.optJSONObject("profiles");
        if (incoming == null) throw new Exception("profiles");
        JSONObject profiles = progressData.getJSONObject("profiles");
        for (Iterator<String> it = incoming.keys(); it.hasNext(); ) {
            String name = it.next();
            JSONObject src = incoming.optJSONObject(name);
            if (src == null) continue;
            JSONObject dst = profiles.optJSONObject(name);
            if (dst == null) {
                profiles.put(name, src);
                continue;
            }
            JSONArray srcAttempts = src.optJSONArray("attempts");
            if (srcAttempts != null && srcAttempts.length() > 0) {
                JSONArray dstAttempts = dst.optJSONArray("attempts");
                if (dstAttempts == null) dstAttempts = new JSONArray();
                Set<String> ids = new HashSet<>();
                for (int i = 0; i < dstAttempts.length(); i++) {
                    JSONObject a = dstAttempts.optJSONObject(i);
                    if (a != null) ids.add(a.optString("id"));
                }
                JSONArray mergedAttempts = new JSONArray();
                for (int i = 0; i < srcAttempts.length() && mergedAttempts.length() < 60; i++) {
                    JSONObject a = srcAttempts.optJSONObject(i);
                    if (a != null && !ids.contains(a.optString("id"))) {
                        mergedAttempts.put(a);
                        ids.add(a.optString("id"));
                    }
                }
                for (int i = 0; i < dstAttempts.length() && mergedAttempts.length() < 60; i++) {
                    mergedAttempts.put(dstAttempts.optJSONObject(i));
                }
                dst.put("attempts", mergedAttempts);
            }
            JSONObject srcErrors = src.optJSONObject("errors");
            if (srcErrors != null) {
                JSONObject dstErrors = dst.optJSONObject("errors");
                if (dstErrors == null) dstErrors = new JSONObject();
                for (Iterator<String> eit = srcErrors.keys(); eit.hasNext(); ) {
                    String id = eit.next();
                    JSONObject srcErr = srcErrors.optJSONObject(id);
                    JSONObject dstErr = dstErrors.optJSONObject(id);
                    if (srcErr == null) continue;
                    if (dstErr == null) {
                        dstErrors.put(id, srcErr);
                    } else {
                        dstErr.put("count", Math.max(dstErr.optInt("count", 0), srcErr.optInt("count", 0)));
                        long dueA = dstErr.optLong("due", Long.MAX_VALUE);
                        long dueB = srcErr.optLong("due", Long.MAX_VALUE);
                        dstErr.put("due", Math.min(dueA, dueB));
                        dstErr.put("last", Math.max(dstErr.optLong("last", 0), srcErr.optLong("last", 0)));
                    }
                }
                dst.put("errors", dstErrors);
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != REQ_IMPORT || resultCode != RESULT_OK || data == null || data.getData() == null) return;
        try {
            Uri uri = data.getData();
            InputStream in = getContentResolver().openInputStream(uri);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            in.close();
            String raw = new String(out.toByteArray(), StandardCharsets.UTF_8);
            JSONObject root = new JSONObject(raw);
            JSONObject payload = root.optJSONObject("data");
            if (payload == null) payload = root;
            if (payload.optJSONObject("profiles") == null) throw new Exception("profiles");
            pendingImport = payload.toString();
            new AlertDialog.Builder(this)
                    .setTitle(t("import_progress"))
                    .setMessage(t("import_confirm"))
                    .setPositiveButton(t("import_progress"), (d, w) -> {
                        try {
                            mergeProgress(new JSONObject(pendingImport));
                            pendingImport = null;
                            ensureProfile();
                            saveProgress();
                            toast(t("import_done"));
                            showSetup();
                        } catch (Exception e) {
                            toast(t("import_error"));
                        }
                    })
                    .setNegativeButton(t("exam_confirm_cancel"), null)
                    .show();
        } catch (Exception e) {
            toast(t("import_error"));
        }
    }

    private LinearLayout modelsCard() {
        LinearLayout card = card();
        addCardHeader(card, t("models_title_g"), t("models_help"));
        HorizontalScrollView hs = new HorizontalScrollView(this);
        hs.setHorizontalScrollBarEnabled(false);
        LinearLayout quick = row();
        String[][] presets = {
                {"all", t("select_all")}, {"none", t("clear_all")}, {"6000", t("preset_6000")},
                {"legacy", t("preset_legacy")}, {"6530", t("preset_6530")}, {"6230", t("preset_6230")}
        };
        for (String[] p : presets) {
            Button b = smallButton(p[1]);
            b.setOnClickListener(v -> { applyPreset(p[0]); showSetup(); });
            quick.addView(b, right(6));
        }
        hs.addView(quick);
        card.addView(hs, top(10));

        List<String> ids = new ArrayList<>();
        for (String m : MODEL_ORDER) if (Bank.MODELS.containsKey(m)) ids.add(m);
        for (int i = 0; i < ids.size(); i += 2) {
            LinearLayout r = row();
            r.addView(modelCheck(ids.get(i)), weight());
            if (i + 1 < ids.size()) r.addView(modelCheck(ids.get(i + 1)), weightLeft(8));
            card.addView(r, top(8));
        }
        return card;
    }

    private CheckBox modelCheck(String id) {
        Bank.ModelInfo m = Bank.MODELS.get(id);
        CheckBox cb = check(m != null ? m.name : id, selModels.contains(id));
        if (m != null) cb.setText(m.name + "\n" + m.specLine());
        cb.setTextSize(13);
        cb.setLineSpacing(dp(2), 1f);
        cb.setOnCheckedChangeListener((v, on) -> {
            if (on) selModels.add(id); else selModels.remove(id);
            saveConfig();
            updatePoolLabel();
        });
        return cb;
    }

    private LinearLayout countTimeCard() {
        LinearLayout card = card();
        LinearLayout r = row();
        LinearLayout a = col();
        a.addView(text(t("count_title"), 16, INK, true));
        a.addView(text(t("count_help"), 12, MUT, false), top(2));
        List<Integer> cv = new ArrayList<>();
        for (int n : COUNTS) cv.add(n);
        if (!cv.contains(count)) cv.add(count);
        Collections.sort(cv);
        Spinner cs = spinner(cv);
        cs.setSelection(cv.indexOf(count));
        cs.setOnItemSelectedListener(new SimpleItemSelected(position -> {
            count = cv.get(position);
            saveConfig();
            updatePoolLabel();
        }));
        a.addView(cs, top(8));
        LinearLayout b = col();
        b.addView(text(t("duration_title"), 16, INK, true));
        b.addView(text(t("duration_help"), 12, MUT, false), top(2));
        List<Integer> dv = new ArrayList<>();
        for (int n : DURATIONS) dv.add(n);
        if (!dv.contains(minutes)) dv.add(minutes);
        List<String> dl = new ArrayList<>();
        for (int n : dv) dl.add(n == 0 ? t("no_limit") : n + " " + t("minutes"));
        Spinner ds = new Spinner(this);
        ArrayAdapter<String> da = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, dl);
        da.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        ds.setAdapter(da);
        ds.setSelection(dv.indexOf(minutes));
        ds.setBackground(round(CARD, 10, LINE, 1));
        ds.setPadding(dp(8), 0, dp(8), 0);
        ds.setOnItemSelectedListener(new SimpleItemSelected(position -> {
            minutes = dv.get(position);
            saveConfig();
        }));
        b.addView(ds, top(8));
        r.addView(a, weight());
        r.addView(b, weightLeft(14));
        card.addView(r);
        return card;
    }

    private LinearLayout typesCard() {
        LinearLayout card = card();
        addCardHeader(card, t("types_title_g"), t("types_help"));
        for (int i = 0; i < TYPE_ORDER.length; i++) {
            String type = TYPE_ORDER[i];
            CheckBox cb = check(typeLabel(type) + "  (" + poolForType(type).size() + ")", selTypes.contains(type));
            cb.setTextSize(14);
            final int idx = i;
            cb.setOnCheckedChangeListener((v, on) -> {
                if (on) selTypes.add(TYPE_ORDER[idx]); else selTypes.remove(TYPE_ORDER[idx]);
                saveConfig();
                updatePoolLabel();
            });
            card.addView(cb, top(4));
        }
        return card;
    }

    private LinearLayout optionsCard() {
        LinearLayout card = card();
        card.addView(text(t("options_title"), 16, INK, true));
        Switch sp = new Switch(this);
        sp.setText(t("opt_partial"));
        sp.setTextSize(13);
        sp.setTextColor(INK2);
        sp.setChecked(partial);
        sp.setOnCheckedChangeListener((v, on) -> { partial = on; saveConfig(); });
        card.addView(sp, top(8));
        Switch su = new Switch(this);
        su.setText(t("opt_exclude"));
        su.setTextSize(13);
        su.setTextColor(INK2);
        su.setChecked(unseen);
        su.setOnCheckedChangeListener((v, on) -> { unseen = on; saveConfig(); });
        card.addView(su, top(4));
        return card;
    }

    private void updatePoolLabel() {
        if (poolView == null) return;
        if ("review".equals(mode)) {
            poolView.setText(dueIds().size() + " " + t("review_due").toLowerCase()
                    + " · " + errorIds().size() + " " + t("stat_errors").toLowerCase());
            return;
        }
        List<Question> p = pool();
        poolView.setText(p.size() + " " + t("pool_label").toLowerCase() + " · " + unseenCount(p) + " " + t("pool_new"));
    }

    private void applyPreset(String p) {
        selModels.clear();
        if ("all".equals(p)) Collections.addAll(selModels, MODEL_ORDER);
        else if ("none".equals(p)) { /* empty */ }
        else if ("6000".equals(p)) Collections.addAll(selModels, "6230", "6330", "6530");
        else if ("legacy".equals(p)) Collections.addAll(selModels, "6210", "6320", "6420");
        else if ("6530".equals(p)) selModels.add("6530");
        else if ("6230".equals(p)) selModels.add("6230");
        saveConfig();
    }

    private void startExam() {
        if ("review".equals(mode)) {
            List<String> ids = dueIds();
            if (ids.isEmpty()) { toast(t("review_none")); return; }
            startReview(ids);
            return;
        }
        if (selModels.isEmpty()) { toast(t("choose_model")); return; }
        if (selTypes.isEmpty()) { toast(t("choose_type")); return; }
        List<Question> p = pool();
        if (p.size() < count) {
            toast(t("not_enough") + " (" + p.size() + "/" + count + ")");
            return;
        }
        List<Question> picked = pick(p, count);
        if (picked.size() < count) { toast(t("not_enough")); return; }
        exam = new Exam();
        exam.id = "exam-" + System.currentTimeMillis();
        exam.qs = picked;
        exam.startedAt = System.currentTimeMillis();
        exam.mode = mode;
        exam.instant = "study".equals(mode);
        exam.endsAt = ("exam".equals(mode) && minutes > 0) ? exam.startedAt + minutes * 60000L : 0;
        exam.errorSnapshot = new HashMap<>();
        discardSavedExam();
        showExam();
        startTimer();
    }

    /* ---------------------------------------------------------------- exam */
    private void showExam() {
        if (exam == null) { showSetup(); return; }
        screen = Screen.EXAM;
        LinearLayout root = col();
        root.setBackgroundColor(BG);
        root.addView(header());

        LinearLayout top = row();
        top.setPadding(dp(16), dp(12), dp(16), dp(8));
        qCountView = text("", 14, INK, true);
        timerView = text("", 14, BRAND, true);
        timerView.setTypeface(Typeface.MONOSPACE, Typeface.BOLD);
        timerView.setGravity(Gravity.CENTER);
        timerView.setBackground(round(CARD, 8, LINE, 1));
        timerView.setPadding(dp(9), dp(5), dp(9), dp(5));
        Button quit = smallButton(t("exam_finish"));
        quit.setOnClickListener(v -> requestFinish());
        top.addView(qCountView);
        LinearLayout spacer = new LinearLayout(this);
        top.addView(spacer, new LinearLayout.LayoutParams(0, 1, 1f));
        top.addView(timerView, right(8));
        top.addView(quit);
        root.addView(top);

        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setMax(exam.qs.size());
        progress.setProgressTintList(ColorStateList.valueOf(BRAND));
        progress.setProgressBackgroundTintList(ColorStateList.valueOf(LINE));
        LinearLayout.LayoutParams plp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(4));
        plp.setMargins(dp(16), 0, dp(16), dp(8));
        root.addView(progress, plp);

        HorizontalScrollView hs = new HorizontalScrollView(this);
        hs.setHorizontalScrollBarEnabled(false);
        paletteRow = row();
        paletteRow.setPadding(dp(14), 0, dp(14), dp(8));
        paletteButtons.clear();
        for (int i = 0; i < exam.qs.size(); i++) {
            final int idx = i;
            Button b = new Button(this);
            b.setText(String.valueOf(i + 1));
            b.setTextSize(11);
            b.setAllCaps(false);
            b.setMinWidth(0);
            b.setMinimumWidth(0);
            b.setMinHeight(0);
            b.setMinimumHeight(0);
            b.setPadding(0, 0, 0, 0);
            b.setStateListAnimator(null);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(dp(33), dp(33));
            lp.setMargins(dp(2), 0, dp(2), 0);
            b.setLayoutParams(lp);
            b.setOnClickListener(v -> { exam.index = idx; saveExamState(); renderQuestion(); updateChrome(); });
            paletteButtons.add(b);
            paletteRow.addView(b);
        }
        hs.addView(paletteRow);
        root.addView(hs);

        ScrollView sv = new ScrollView(this);
        sv.setFillViewport(false);
        qCard = col();
        qCard.setBackground(round(CARD, 16, LINE, 1));
        qCard.setPadding(dp(17), dp(17), dp(17), dp(18));
        LinearLayout.LayoutParams qlp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        qlp.setMargins(dp(14), dp(4), dp(14), dp(14));
        qCard.setLayoutParams(qlp);
        sv.addView(qCard);
        root.addView(sv, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));

        LinearLayout nav = row();
        nav.setPadding(dp(14), dp(8), dp(14), dp(12));
        prevButton = button(t("exam_prev"), false);
        prevButton.setOnClickListener(v -> {
            if (exam.index > 0) { exam.index--; saveExamState(); renderQuestion(); updateChrome(); }
        });
        flagButton = button(t("exam_flag"), false);
        flagButton.setOnClickListener(v -> {
            String id = exam.qs.get(exam.index).id;
            if (exam.flags.contains(id)) exam.flags.remove(id); else exam.flags.add(id);
            saveExamState();
            updateChrome();
        });
        nextButton = button(t("exam_next"), true);
        nextButton.setOnClickListener(v -> {
            if (exam.index >= exam.qs.size() - 1) requestFinish();
            else { exam.index++; renderQuestion(); updateChrome(); }
        });
        nav.addView(prevButton, weight());
        nav.addView(flagButton, weightLeft(7));
        nav.addView(nextButton, weightLeft(7));
        root.addView(nav);
        setContentView(root);
        renderQuestion();
        updateChrome();
        saveExamState();
        tick();
    }

    private void renderQuestion() {
        if (qCard == null || exam == null) return;
        final Question q = exam.qs.get(exam.index);
        JSONObject d = q.d(lang);
        qCard.removeAllViews();
        LinearLayout chips = row();
        chips.addView(chip(typeLabel(q.type), SOFT, BRAND));
        for (String m : q.models) chips.addView(chip(m, SOFT, MUT), left(5));
        qCard.addView(chips);
        TextView qt = text(d.optString("q", ""), 18, INK, true);
        qt.setLineSpacing(dp(3), 1f);
        qCard.addView(qt, top(12));
        TextView instr = text(instructions(q), 12, MUT, false);
        qCard.addView(instr, top(6));

        Object ans = exam.answers.get(q.id);
        if ("single".equals(q.type) || "errmap".equals(q.type)) {
            RadioGroup group = new RadioGroup(this);
            group.setOrientation(RadioGroup.VERTICAL);
            Map<Integer, String> ids = new HashMap<>();
            String selected = ans instanceof String ? (String) ans : null;
            for (Bank.Option o : q.options(lang)) {
                RadioButton rb = new RadioButton(this);
                rb.setText(o.text);
                rb.setTextSize(15);
                rb.setTextColor(INK2);
                rb.setButtonTintList(ColorStateList.valueOf(BRAND));
                rb.setPadding(0, dp(7), 0, dp(7));
                rb.setId(View.generateViewId());
                ids.put(rb.getId(), o.id);
                rb.setChecked(o.id.equals(selected));
                group.addView(rb);
            }
            group.setOnCheckedChangeListener((g, checkedId) -> {
                String id = ids.get(checkedId);
                if (id != null) exam.answers.put(q.id, id);
                saveExamState();
                updateChrome();
                if (exam.instant) renderQuestion();
            });
            qCard.addView(group, top(8));
        } else if ("multi".equals(q.type)) {
            Set<String> selected = ans instanceof Set ? castSet(ans) : new HashSet<>();
            for (Bank.Option o : q.options(lang)) {
                CheckBox cb = new CheckBox(this);
                cb.setText(o.text);
                cb.setTextSize(15);
                cb.setTextColor(INK2);
                cb.setButtonTintList(ColorStateList.valueOf(BRAND));
                cb.setPadding(0, dp(7), 0, dp(7));
                cb.setChecked(selected.contains(o.id));
                cb.setOnCheckedChangeListener((v, on) -> {
                    Set<String> set = exam.answers.get(q.id) instanceof Set ? castSet(exam.answers.get(q.id)) : new HashSet<>();
                    if (on) set.add(o.id); else set.remove(o.id);
                    exam.answers.put(q.id, set);
                    saveExamState();
                    updateChrome();
                    if (exam.instant) renderQuestion();
                });
                qCard.addView(cb);
            }
        } else if ("fill".equals(q.type) || "calc".equals(q.type)) {
            List<Bank.Field> fields = q.fields(lang);
            List<String> vals = ans instanceof List ? castList(ans) : new ArrayList<>();
            for (int i = 0; i < fields.size(); i++) {
                Bank.Field f = fields.get(i);
                LinearLayout box = col();
                box.addView(text(f.label, 13, INK2, true), top(10));
                LinearLayout line = row();
                EditText et = new EditText(this);
                et.setTextSize(15);
                et.setTextColor(INK);
                et.setSingleLine(true);
                et.setBackground(round(CARD, 9, LINE, 1));
                et.setPadding(dp(11), dp(8), dp(11), dp(8));
                if ("calc".equals(q.type)) et.setInputType(android.text.InputType.TYPE_CLASS_NUMBER | android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL | android.text.InputType.TYPE_NUMBER_FLAG_SIGNED);
                et.setText(i < vals.size() ? vals.get(i) : "");
                final int idx = i;
                et.addTextChangedListener(new TextWatcher() {
                    public void beforeTextChanged(CharSequence s, int a, int b, int c) {}
                    public void onTextChanged(CharSequence s, int a, int b, int c) {}
                    public void afterTextChanged(Editable s) {
                        List<String> list = exam.answers.get(q.id) instanceof List ? castList(exam.answers.get(q.id)) : new ArrayList<>();
                        while (list.size() <= idx) list.add("");
                        list.set(idx, s.toString());
                        exam.answers.put(q.id, list);
                        saveExamState();
                        updateChrome();
                    }
                });
                line.addView(et, weight());
                TextView unit = text(f.unit, 12, MUT, false);
                unit.setPadding(dp(8), 0, 0, 0);
                line.addView(unit);
                box.addView(line, top(5));
                qCard.addView(box);
            }
        } else {
            EditText et = new EditText(this);
            et.setTextSize(15);
            et.setTextColor(INK);
            et.setMinLines(5);
            et.setGravity(Gravity.TOP | Gravity.START);
            et.setBackground(round(CARD, 9, LINE, 1));
            et.setPadding(dp(11), dp(10), dp(11), dp(10));
            et.setText(ans instanceof String ? (String) ans : "");
            et.addTextChangedListener(new TextWatcher() {
                public void beforeTextChanged(CharSequence s, int a, int b, int c) {}
                public void onTextChanged(CharSequence s, int a, int b, int c) {}
                public void afterTextChanged(Editable s) {
                    exam.answers.put(q.id, s.toString());
                    saveExamState();
                    updateChrome();
                }
            });
            qCard.addView(et, top(10));
        }
        if (exam.instant) {
            Object latest = exam.answers.get(q.id);
            if (isAnswered(q, latest)) qCard.addView(instantFeedback(q, latest), top(10));
        }
    }

    private LinearLayout instantFeedback(Question q, Object ans) {
        Double g = grade(q, ans);
        boolean correct = g != null && g >= 0.999;
        LinearLayout box = col();
        box.setBackground(round(correct ? OK_BG : BAD_BG, 10, correct ? OK : BAD, 1));
        box.setPadding(dp(11), dp(9), dp(11), dp(9));
        String label = correct ? t("exam_correct") : (g != null && g > 0 ? t("res_partial") : t("exam_incorrect"));
        box.addView(text(label, 13, correct ? OK : BAD, true));
        box.addView(text(t("exam_answer_was") + ": " + correctText(q), 12, INK2, false), top(4));
        String ex = q.d(lang).optString("explanation", "");
        if (!ex.isEmpty()) box.addView(text(t("exam_explanation") + ": " + ex, 11, MUT, false), top(3));
        return box;
    }

    private String instructions(Question q) {
        if ("single".equals(q.type) || "errmap".equals(q.type)) return t("exam_instructions_single");
        if ("multi".equals(q.type)) return t("exam_instructions_multi");
        if ("fill".equals(q.type)) return t("exam_instructions_fill");
        if ("calc".equals(q.type)) return t("exam_instructions_calc");
        return t("exam_instructions_open");
    }

    private void updateChrome() {
        if (exam == null) return;
        int total = exam.qs.size();
        int done = answeredCount();
        if (qCountView != null) qCountView.setText(t("exam_question") + " " + (exam.index + 1) + " " + t("exam_of") + " " + total);
        if (progress != null) { progress.setMax(total); progress.setProgress(done); }
        if (prevButton != null) {
            prevButton.setEnabled(exam.index > 0);
            prevButton.setAlpha(exam.index > 0 ? 1f : 0.45f);
        }
        if (nextButton != null) nextButton.setText(exam.index >= total - 1 ? t("exam_finish") : t("exam_next"));
        if (flagButton != null) {
            boolean f = exam.flags.contains(exam.qs.get(exam.index).id);
            flagButton.setText(f ? t("exam_unflag") : t("exam_flag"));
        }
        for (int i = 0; i < paletteButtons.size(); i++) {
            Button b = paletteButtons.get(i);
            Question q = exam.qs.get(i);
            boolean answered = isAnswered(q, exam.answers.get(q.id));
            boolean flag = exam.flags.contains(q.id);
            int fill = answered ? BRAND : CARD;
            int stroke = i == exam.index ? BRAND : flag ? WARN : LINE;
            b.setBackground(round(fill, 7, stroke, i == exam.index || flag ? 2 : 1));
            b.setTextColor(answered ? WHITE : (i == exam.index ? BRAND : MUT));
        }
        tick();
    }

    private int answeredCount() {
        int n = 0;
        for (Question q : exam.qs) if (isAnswered(q, exam.answers.get(q.id))) n++;
        return n;
    }

    private boolean isAnswered(Question q, Object ans) {
        if (q.isOpen()) return ans instanceof String && !((String) ans).trim().isEmpty();
        if ("multi".equals(q.type)) return ans instanceof Set && !castSet(ans).isEmpty();
        if ("fill".equals(q.type) || "calc".equals(q.type)) {
            if (!(ans instanceof List)) return false;
            for (String s : castList(ans)) if (s != null && !s.trim().isEmpty()) return true;
            return false;
        }
        return ans instanceof String && !((String) ans).isEmpty();
    }

    /* --------------------------------------------------------------- timer */
    private void startTimer() {
        stopTimer();
        ticker = new Runnable() {
            @Override public void run() {
                if (exam == null || exam.submitted) return;
                tick();
                handler.postDelayed(this, 500);
            }
        };
        handler.post(ticker);
    }
    private void stopTimer() {
        if (ticker != null) handler.removeCallbacks(ticker);
        ticker = null;
    }
    private void tick() {
        if (timerView == null || exam == null || exam.submitted) return;
        if (exam.endsAt == 0) {
            timerView.setText("∞");
            timerView.setTextColor(BRAND);
            return;
        }
        long left = Math.max(0, (exam.endsAt - System.currentTimeMillis() + 999) / 1000);
        timerView.setText(String.format(Locale.US, "%02d:%02d", left / 60, left % 60));
        timerView.setTextColor(left <= 60 ? BAD : left <= 300 ? WARN : BRAND);
        if (left <= 0) { stopTimer(); finishExam(true); }
    }

    private void requestFinish() {
        if (exam == null || exam.submitted) return;
        int blank = 0;
        for (Question q : exam.qs) if (!isAnswered(q, exam.answers.get(q.id))) blank++;
        if (blank > 0) {
            new AlertDialog.Builder(this)
                    .setTitle(t("exam_confirm_title"))
                    .setMessage(t("exam_confirm_text"))
                    .setPositiveButton(t("exam_confirm_ok"), (d, w) -> finishExam(false))
                    .setNegativeButton(t("exam_confirm_cancel"), null)
                    .show();
        } else finishExam(false);
    }

    private void finishExam(boolean auto) {
        if (exam == null || exam.submitted) return;
        stopTimer();
        exam.submitted = true;
        exam.finishedAt = System.currentTimeMillis();
        for (Question q : exam.qs) seen.put(q.id, (seen.containsKey(q.id) ? seen.get(q.id) : 0) + 1);
        saveSeen();
        recordResult(score());
        discardSavedExam();
        if (auto) toast(t("exam_time_up"));
        showResults();
    }

    /* -------------------------------------------------------------- grading */
    private Double grade(Question q, Object ans) {
        if (q.isOpen()) return exam.self.get(q.id);
        if (!isAnswered(q, ans)) return 0.0;
        if ("single".equals(q.type) || "errmap".equals(q.type)) {
            return q.answer(lang).contains((String) ans) ? 1.0 : 0.0;
        }
        if ("multi".equals(q.type)) {
            List<String> correct = q.answer(lang);
            Set<String> sel = castSet(ans);
            int hits = 0, wrong = 0;
            for (String s : sel) { if (correct.contains(s)) hits++; else wrong++; }
            if (hits == 0) return 0.0;
            if (hits == correct.size() && wrong == 0) return 1.0;
            if (!partial) return 0.0;
            return Math.max(0, (hits - wrong) / (double) correct.size());
        }
        if ("fill".equals(q.type) || "calc".equals(q.type)) {
            List<Bank.Field> fields = q.fields(lang);
            List<String> vals = castList(ans);
            if (fields.isEmpty()) return 0.0;
            int ok = 0;
            for (int i = 0; i < fields.size(); i++) {
                String v = i < vals.size() ? vals.get(i) : "";
                if (matchField(fields.get(i), v)) ok++;
            }
            return ok / (double) fields.size();
        }
        return 0.0;
    }

    private boolean matchField(Bank.Field f, String value) {
        String raw = value == null ? "" : value.trim();
        if (raw.isEmpty()) return false;
        boolean numeric = !f.answers.isEmpty();
        for (Object a : f.answers) {
            if (a instanceof Number) continue;
            try { Double.parseDouble(String.valueOf(a).replace(",", ".")); }
            catch (Exception e) { numeric = false; break; }
        }
        if (numeric) {
            double v;
            try { v = Double.parseDouble(raw.replace(",", ".")); } catch (Exception e) { return false; }
            double tol = f.tolerance > 0 ? f.tolerance : 0.001;
            for (Object a : f.answers) {
                if (Math.abs(v - Double.parseDouble(String.valueOf(a).replace(",", "."))) <= tol + 1e-9) return true;
            }
            return false;
        }
        for (Object a : f.answers) if (norm(String.valueOf(a)).equals(norm(raw))) return true;
        return false;
    }

    private Result score() {
        Result r = new Result();
        r.total = exam.qs.size();
        for (int i = 0; i < exam.qs.size(); i++) {
            Question q = exam.qs.get(i);
            Object ans = exam.answers.get(q.id);
            boolean blank = !isAnswered(q, ans);
            Double g = grade(q, ans);
            Row row = new Row();
            row.q = q;
            row.answer = ans;
            row.grade = g;
            boolean isOpen = q.isOpen();
            if (isOpen && !exam.self.containsKey(q.id)) row.status = "pending";
            else if (blank) row.status = "blank";
            else if (g == null) row.status = "pending";
            else if (g >= 0.999) row.status = "ok";
            else if (g > 0) row.status = "half";
            else row.status = "bad";
            if ("pending".equals(row.status)) r.pending++;
            else if ("ok".equals(row.status)) r.ok++;
            else if ("blank".equals(row.status)) r.blank++;
            else r.bad++;
            r.points += g == null ? 0 : g;
            double[] bt = r.byType.get(q.type);
            if (bt == null) { bt = new double[2]; r.byType.put(q.type, bt); }
            bt[0] += 1;
            bt[1] += g == null ? 0 : g;
            r.rows.add(row);
        }
        return r;
    }

    /* ------------------------------------------------------------- results */
    private void showResults() {
        if (exam == null) { showSetup(); return; }
        screen = Screen.RESULTS;
        stopTimer();
        Result r = score();
        int pct = (int) Math.round(r.total == 0 ? 0 : r.points / r.total * 100);
        boolean pass = pct >= 70;

        LinearLayout root = col();
        root.setBackgroundColor(BG);
        root.addView(header());
        ScrollView sv = new ScrollView(this);
        resultScroll = sv;
        LinearLayout c = col();
        c.setPadding(dp(16), dp(16), dp(16), dp(28));

        LinearLayout scoreCard = col();
        scoreCard.setBackground(round(0xFF0B2D4E, 18, 0, 0));
        scoreCard.setPadding(dp(20), dp(20), dp(20), dp(20));
        TextView lab = text(t("res_title").toUpperCase(Locale.ROOT), 11, 0xFF9FC7E4, true);
        lab.setLetterSpacing(0.12f);
        scoreCard.addView(lab);
        TextView big = text(pct + "%", 54, WHITE, true);
        big.setLetterSpacing(-0.04f);
        scoreCard.addView(big, top(6));
        String pill = r.pending > 0 ? t("res_pending") : pass ? t("res_pass") : t("res_fail");
        scoreCard.addView(chip(pill, r.pending > 0 ? 0x33FFC46B : pass ? 0x3347C7A1 : 0x33FF8F87,
                r.pending > 0 ? 0xFFFFD18A : pass ? 0xFF6FE0BC : 0xFFFFB0AA), top(8));
        scoreCard.addView(text(fmt(r.points) + " / " + r.total + " " + t("res_points") + " · " + t("res_threshold") + " 70 %", 12, 0xFF9FC7E4, false), top(10));
        c.addView(scoreCard);

        LinearLayout actions = row();
        Button retry = button(t("res_retry"), true);
        retry.setOnClickListener(v -> startExam());
        Button fresh = button(t("res_new"), false);
        fresh.setOnClickListener(v -> showSetup());
        actions.addView(retry, weight());
        actions.addView(fresh, weightLeft(8));
        c.addView(actions, top(12));
        LinearLayout extra = row();
        Button share = smallButton(t("share_result"));
        share.setOnClickListener(v -> shareResult(r));
        extra.addView(share, weight());
        if (wrongIds(r).length() > 0) {
            Button review = smallButton(t("res_review_errors"));
            review.setOnClickListener(v -> startReview(jsonList(wrongIds(r))));
            extra.addView(review, weightLeft(7));
        }
        c.addView(extra, top(7));

        LinearLayout stats1 = row();
        stats1.addView(statBox(String.valueOf(r.ok), t("res_filter_ok")), weight());
        stats1.addView(statBox(String.valueOf(r.bad), t("res_filter_bad")), weightLeft(8));
        c.addView(stats1, top(12));
        LinearLayout stats2 = row();
        stats2.addView(statBox(String.valueOf(r.blank), t("res_filter_blank")), weight());
        stats2.addView(statBox(String.valueOf(r.pending), t("res_pending")), weightLeft(8));
        c.addView(stats2, top(8));

        LinearLayout bd = card();
        bd.addView(text(t("res_breakdown"), 15, INK, true));
        for (Map.Entry<String, double[]> e : r.byType.entrySet()) {
            double p = e.getValue()[0] == 0 ? 0 : e.getValue()[1] / e.getValue()[0] * 100;
            LinearLayout line = row();
            line.setPadding(0, dp(7), 0, dp(7));
            TextView name = text(typeLabel(e.getKey()), 11, INK2, false);
            name.setSingleLine(true);
            line.addView(name, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1.8f));
            ProgressBar pb = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
            pb.setMax(100); pb.setProgress((int) Math.round(p));
            pb.setProgressTintList(ColorStateList.valueOf(BRAND));
            pb.setProgressBackgroundTintList(ColorStateList.valueOf(LINE));
            line.addView(pb, new LinearLayout.LayoutParams(0, dp(7), 1.5f));
            TextView v = text(Math.round(p) + "%", 12, INK, true);
            v.setGravity(Gravity.END);
            line.addView(v, new LinearLayout.LayoutParams(dp(48), ViewGroup.LayoutParams.WRAP_CONTENT));
            bd.addView(line);
        }
        c.addView(bd, top(12));

        // Open-question self assessment
        List<Question> opens = new ArrayList<>();
        for (Question q : exam.qs) if (q.isOpen()) opens.add(q);
        if (!opens.isEmpty()) {
            LinearLayout sc = card();
            sc.addView(text(t("res_self"), 15, INK, true));
            sc.addView(text(t("res_self_note"), 11, MUT, false), top(4));
            for (Question q : opens) {
                LinearLayout item = col();
                item.setPadding(0, dp(10), 0, dp(10));
                TextView qt = text(q.text(lang), 13, INK, true);
                item.addView(qt);
                Object ans = exam.answers.get(q.id);
                item.addView(text(t("res_your_answer") + ": " + (ans == null ? t("res_no_answer") : ans.toString()), 11, MUT, false), top(4));
                for (String ru : q.rubric(lang)) item.addView(text("• " + ru, 11, INK2, false), top(2));
                LinearLayout btns = row();
                double s = exam.self.containsKey(q.id) ? exam.self.get(q.id) : -1;
                String[] labels = {t("res_self_1"), t("res_self_half"), t("res_self_0")};
                double[] scores = {1, 0.5, 0};
                for (int i = 0; i < 3; i++) {
                    final double scoreVal = scores[i];
                    Button b = button(labels[i], s == scoreVal);
                    b.setTextSize(10);
                    b.setOnClickListener(v -> {
                        restoreScrollY = resultScroll == null ? -1 : resultScroll.getScrollY();
                        exam.self.put(q.id, scoreVal);
                        syncErrors(score());
                        showResults();
                    });
                    btns.addView(b, weightLeft(i == 0 ? 0 : 5));
                }
                item.addView(btns, top(7));
                sc.addView(item);
            }
            c.addView(sc, top(12));
        }

        LinearLayout reviewCard = card();
        reviewCard.addView(text(t("res_review"), 15, INK, true));
        LinearLayout filters = row();
        String[] fLabels = {t("res_filter_all"), t("res_filter_ok"), t("res_filter_bad")};
        for (int i = 0; i < 3; i++) {
            final int fi = i;
            Button b = button(fLabels[i], reviewFilter == i);
            b.setTextSize(10);
            b.setOnClickListener(v -> {
                restoreScrollY = resultScroll == null ? -1 : resultScroll.getScrollY();
                reviewFilter = fi;
                showResults();
            });
            filters.addView(b, weightLeft(i == 0 ? 0 : 5));
        }
        reviewCard.addView(filters, top(8));
        c.addView(reviewCard, top(12));

        for (Row row : r.rows) {
            if (reviewFilter == 1 && !"ok".equals(row.status)) continue;
            if (reviewFilter == 2 && ("ok".equals(row.status) || "blank".equals(row.status) || "pending".equals(row.status))) continue;
            c.addView(reviewItem(row), top(8));
        }

        sv.addView(c);
        root.addView(sv, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        setContentView(root);
        if (restoreScrollY >= 0) {
            final int y = restoreScrollY;
            restoreScrollY = -1;
            sv.post(() -> sv.scrollTo(0, y));
        }
    }

    private void shareResult(Result r) {
        if (exam == null || r == null) return;
        int pct = (int) Math.round(r.total == 0 ? 0 : r.points / r.total * 100);
        String date = new SimpleDateFormat("dd MMM yyyy", Locale.forLanguageTag(lang)).format(new Date());
        String text = "Factronics TTO Lab\n"
                + t("res_title") + ": " + pct + "%\n"
                + modeLabel(exam.mode) + " · " + r.ok + "/" + r.total + " " + t("res_filter_ok") + "\n"
                + date + "\n"
                + t("legal_android");
        Intent send = new Intent(Intent.ACTION_SEND);
        send.setType("text/plain");
        send.putExtra(Intent.EXTRA_SUBJECT, "Factronics TTO Lab · " + pct + "%");
        send.putExtra(Intent.EXTRA_TEXT, text);
        startActivity(Intent.createChooser(send, t("share_result")));
    }

    private LinearLayout reviewItem(Row row) {
        LinearLayout card = card();
        LinearLayout top = row();
        String status = row.status;
        int color = "ok".equals(status) ? OK : "half".equals(status) || "pending".equals(status) ? WARN : BAD;
        int bgc = "ok".equals(status) ? OK_BG : "half".equals(status) || "pending".equals(status) ? AMBER_BG : BAD_BG;
        String label = "ok".equals(status) ? t("res_correct_answer") : "half".equals(status) ? t("res_partial") :
                "pending".equals(status) ? t("res_pending") : "blank".equals(status) ? t("res_no_answer") : t("res_wrong");
        top.addView(chip(label, bgc, color));
        TextView meta = text(typeLabel(row.q.type) + " · " + join(row.q.models, " / "), 10, MUT, false);
        meta.setPadding(dp(7), dp(4), 0, 0);
        top.addView(meta);
        TextView pts = text(row.grade == null ? "—" : fmt(row.grade) + " / 1", 10, MUT, true);
        pts.setGravity(Gravity.END);
        top.addView(pts, weight());
        card.addView(top);
        TextView qt = text(row.q.text(lang), 13, INK, true);
        qt.setPadding(0, dp(6), 0, 0);
        card.addView(qt);
        card.addView(text(t("res_your_answer") + ": " + answerText(row.q, row.answer), 11, INK2, false), top(5));
        if (!row.q.isOpen()) card.addView(text(t("res_correct_answer") + ": " + correctText(row.q), 11, OK, false), top(3));
        if (row.q.isOpen()) {
            card.addView(text(t("res_model_answer") + ":\n" + row.q.modelAnswer(lang), 11, INK2, false), top(5));
        }
        if (!row.q.explanation(lang).isEmpty()) {
            TextView ex = text(row.q.explanation(lang), 11, INK2, false);
            ex.setBackground(round(SOFT, 8, LINE, 1));
            ex.setPadding(dp(9), dp(7), dp(9), dp(7));
            card.addView(ex, top(6));
        }
        return card;
    }

    private String answerText(Question q, Object ans) {
        if (q.isChoice()) {
            if (ans == null) return t("res_no_answer");
            List<String> ids = new ArrayList<>();
            if (ans instanceof Set) ids.addAll(castSet(ans)); else ids.add(String.valueOf(ans));
            List<String> texts = new ArrayList<>();
            for (String id : ids) for (Bank.Option o : q.options(lang)) if (o.id.equals(id)) texts.add(o.text);
            return texts.isEmpty() ? t("res_no_answer") : join(texts, " · ");
        }
        if ("fill".equals(q.type) || "calc".equals(q.type)) {
            List<Bank.Field> fields = q.fields(lang);
            List<String> vals = ans instanceof List ? castList(ans) : new ArrayList<>();
            List<String> parts = new ArrayList<>();
            for (int i = 0; i < fields.size(); i++) parts.add(fields.get(i).label + ": " + (i < vals.size() && !vals.get(i).isEmpty() ? vals.get(i) : t("res_no_answer")));
            return join(parts, " · ");
        }
        return ans == null || String.valueOf(ans).trim().isEmpty() ? t("res_no_answer") : String.valueOf(ans);
    }

    private String correctText(Question q) {
        if (q.isChoice()) {
            List<String> texts = new ArrayList<>();
            for (String id : q.answer(lang)) for (Bank.Option o : q.options(lang)) if (o.id.equals(id)) texts.add(o.text);
            return join(texts, " · ");
        }
        List<String> parts = new ArrayList<>();
        for (Bank.Field f : q.fields(lang)) {
            List<String> vals = new ArrayList<>();
            for (Object a : f.answers) vals.add(fmt(a));
            parts.add(f.label + ": " + join(vals, " / ") + (f.unit.isEmpty() ? "" : " " + f.unit));
        }
        return join(parts, " · ");
    }

    /* ---------------------------------------------------------------- views */
    private LinearLayout header() {
        LinearLayout h = row();
        h.setBackgroundColor(BRAND);
        h.setPadding(dp(14), dp(11), dp(12), dp(11));
        h.setGravity(Gravity.CENTER_VERTICAL);
        if (logo != null) {
            ImageView iv = new ImageView(this);
            iv.setImageBitmap(logo);
            iv.setScaleType(ImageView.ScaleType.FIT_CENTER);
            iv.setBackground(round(WHITE, 6, 0, 0));
            iv.setPadding(dp(4), dp(4), dp(4), dp(4));
            h.addView(iv, new LinearLayout.LayoutParams(dp(58), dp(28)));
        }
        TextView title = text("TTO Lab", 18, WHITE, true);
        title.setPadding(dp(9), 0, 0, 0);
        h.addView(title);
        TextView sub = text("DISTRIB. VIDEOJET", 8, 0x99FFFFFF, true);
        sub.setLetterSpacing(0.10f);
        sub.setPadding(dp(8), dp(2), 0, 0);
        h.addView(sub);
        LinearLayout spacer = new LinearLayout(this);
        h.addView(spacer, new LinearLayout.LayoutParams(0, 1, 1f));
        Button theme = new Button(this);
        theme.setText(dark ? "☀" : "◐");
        theme.setTextSize(14);
        theme.setAllCaps(false);
        theme.setMinWidth(0); theme.setMinimumWidth(0);
        theme.setMinHeight(0); theme.setMinimumHeight(0);
        theme.setPadding(dp(7), dp(3), dp(7), dp(3));
        theme.setStateListAnimator(null);
        theme.setTextColor(WHITE);
        theme.setBackground(round(0x22FFFFFF, 6, 0x44FFFFFF, 1));
        theme.setContentDescription(t(dark ? "theme_light" : "theme_dark"));
        LinearLayout.LayoutParams tlp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, dp(28));
        tlp.setMargins(0, 0, dp(5), 0);
        theme.setLayoutParams(tlp);
        theme.setOnClickListener(v -> toggleTheme());
        h.addView(theme);
        String[] langs = {"es", "en", "pt"};
        for (String l : langs) {
            Button b = new Button(this);
            b.setText(l.toUpperCase(Locale.ROOT));
            b.setTextSize(10);
            b.setAllCaps(false);
            b.setMinWidth(0); b.setMinimumWidth(0);
            b.setMinHeight(0); b.setMinimumHeight(0);
            b.setPadding(dp(7), dp(4), dp(7), dp(4));
            b.setStateListAnimator(null);
            b.setTextColor(l.equals(lang) ? BRAND : 0xCCFFFFFF);
            b.setBackground(l.equals(lang) ? round(WHITE, 6, 0, 0) : round(0x22FFFFFF, 6, 0x44FFFFFF, 1));
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, dp(28));
            lp.setMargins(dp(3), 0, 0, 0);
            b.setLayoutParams(lp);
            b.setOnClickListener(v -> setLang(l));
            h.addView(b);
        }
        return h;
    }

    private LinearLayout card() {
        LinearLayout c = col();
        c.setBackground(round(CARD, 16, LINE, 1));
        c.setPadding(dp(16), dp(16), dp(16), dp(16));
        return c;
    }

    private void addCardHeader(LinearLayout card, String title, String hint) {
        card.addView(text(title, 16, INK, true));
        card.addView(text(hint, 12, MUT, false), top(3));
    }

    private LinearLayout statBox(String value, String label) {
        LinearLayout b = col();
        b.setBackground(round(CARD, 10, LINE, 1));
        b.setPadding(dp(10), dp(9), dp(8), dp(9));
        b.addView(text(value, 18, INK, true));
        TextView l = text(label, 9, MUT, true);
        l.setSingleLine(true);
        b.addView(l);
        return b;
    }

    private TextView kicker(String s) {
        TextView v = text(s.toUpperCase(Locale.ROOT), 10, BRAND, true);
        v.setLetterSpacing(0.14f);
        return v;
    }

    private TextView chip(String s, int bg, int fg) {
        TextView v = text(s, 10, fg, true);
        v.setBackground(round(bg, 20, 0, 0));
        v.setPadding(dp(8), dp(3), dp(8), dp(3));
        return v;
    }

    private TextView text(String s, int sp, int color, boolean bold) {
        TextView v = new TextView(this);
        v.setText(s == null ? "" : s);
        v.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        v.setTextColor(color);
        if (bold) v.setTypeface(Typeface.create("sans-serif-medium", Typeface.NORMAL));
        return v;
    }

    private Button button(String s, boolean primary) {
        Button b = new Button(this);
        b.setText(s);
        b.setTextSize(13);
        b.setAllCaps(false);
        b.setTypeface(Typeface.create("sans-serif-medium", Typeface.NORMAL));
        b.setTextColor(primary ? WHITE : INK2);
        b.setBackground(primary ? round(BRAND, 11, 0, 0) : round(CARD, 11, LINE, 1));
        b.setMinHeight(dp(44));
        b.setPadding(dp(10), 0, dp(10), 0);
        b.setStateListAnimator(null);
        b.setElevation(dp(1));
        return b;
    }

    private Button smallButton(String s) {
        Button b = button(s, false);
        b.setTextSize(11);
        b.setMinHeight(dp(32));
        b.setPadding(dp(8), 0, dp(8), 0);
        return b;
    }

    private CheckBox check(String s, boolean checked) {
        CheckBox cb = new CheckBox(this);
        cb.setText(s);
        cb.setTextSize(14);
        cb.setTextColor(INK2);
        cb.setChecked(checked);
        cb.setButtonTintList(ColorStateList.valueOf(BRAND));
        cb.setPadding(0, dp(3), 0, dp(3));
        return cb;
    }

    private Spinner spinner(List<Integer> values) {
        List<String> labels = new ArrayList<>();
        for (Integer v : values) labels.add(String.valueOf(v));
        Spinner sp = new Spinner(this);
        ArrayAdapter<String> ad = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, labels);
        ad.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        sp.setAdapter(ad);
        sp.setBackground(round(CARD, 10, LINE, 1));
        sp.setPadding(dp(8), 0, dp(8), 0);
        return sp;
    }

    private LinearLayout col() {
        LinearLayout l = new LinearLayout(this);
        l.setOrientation(LinearLayout.VERTICAL);
        return l;
    }

    private LinearLayout row() {
        LinearLayout l = new LinearLayout(this);
        l.setOrientation(LinearLayout.HORIZONTAL);
        l.setGravity(Gravity.CENTER_VERTICAL);
        return l;
    }

    private GradientDrawable round(int color, int radiusDp, int strokeColor, int strokeDp) {
        GradientDrawable g = new GradientDrawable();
        g.setColor(color);
        g.setCornerRadius(dp(radiusDp));
        if (strokeDp > 0) g.setStroke(dp(strokeDp), strokeColor);
        return g;
    }

    private LinearLayout.LayoutParams top(int dp) { return top(dp, ViewGroup.LayoutParams.WRAP_CONTENT); }
    private LinearLayout.LayoutParams top(int dp, int height) {
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, height);
        lp.topMargin = dp(dp);
        return lp;
    }
    private LinearLayout.LayoutParams left(int dp) {
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        lp.leftMargin = dp(dp);
        return lp;
    }
    private LinearLayout.LayoutParams right(int dp) {
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        lp.rightMargin = dp(dp);
        return lp;
    }
    private LinearLayout.LayoutParams weight() { return new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f); }
    private LinearLayout.LayoutParams weightLeft(int dp) {
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
        lp.leftMargin = dp(dp);
        return lp;
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }

    private void toast(String s) { Toast.makeText(this, s, Toast.LENGTH_SHORT).show(); }

    private static boolean contains(String[] arr, String v) {
        for (String x : arr) if (x.equals(v)) return true;
        return false;
    }
    private static boolean contains(int[] arr, int v) {
        for (int x : arr) if (x == v) return true;
        return false;
    }
    private static String join(Iterable<String> it, String sep) {
        StringBuilder sb = new StringBuilder();
        for (String s : it) {
            if (sb.length() > 0) sb.append(sep);
            sb.append(s);
        }
        return sb.toString();
    }
    @SuppressWarnings("unchecked")
    private static Set<String> castSet(Object o) { return (Set<String>) o; }
    @SuppressWarnings("unchecked")
    private static List<String> castList(Object o) { return (List<String>) o; }
    private static String norm(String s) {
        String n = Normalizer.normalize(s == null ? "" : s, Normalizer.Form.NFD);
        return n.replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT).replaceAll("\\s+", " ").trim();
    }
    private String fmt(double v) {
        if (Math.abs(v - Math.rint(v)) < 1e-9) return String.valueOf((long) Math.rint(v));
        String s = String.format(Locale.US, "%.2f", v);
        while (s.endsWith("0")) s = s.substring(0, s.length() - 1);
        if (s.endsWith(".")) s = s.substring(0, s.length() - 1);
        return "en".equals(lang) ? s : s.replace(".", ",");
    }
    private String fmt(Object o) {
        if (o instanceof Number) return fmt(((Number) o).doubleValue());
        return String.valueOf(o);
    }

    private static class SimpleItemSelected implements android.widget.AdapterView.OnItemSelectedListener {
        private final java.util.function.IntConsumer consumer;
        SimpleItemSelected(java.util.function.IntConsumer c) { consumer = c; }
        public void onItemSelected(android.widget.AdapterView<?> parent, View view, int position, long id) { consumer.accept(position); }
        public void onNothingSelected(android.widget.AdapterView<?> parent) {}
    }

    @Override
    public void onBackPressed() {
        if (screen == Screen.EXAM && exam != null && !exam.submitted) {
            new AlertDialog.Builder(this)
                    .setTitle(t("exam_confirm_title"))
                    .setPositiveButton(t("exam_finish"), (d, w) -> requestFinish())
                    .setNeutralButton(t("res_new"), (d, w) -> { discardSavedExam(); showSetup(); })
                    .setNegativeButton(t("exam_confirm_cancel"), null)
                    .show();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        if (!prefs.contains("dark")) {
            applyTheme();
            refreshScreen();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        saveConfig();
        saveSeen();
        saveExamState();
    }

    @Override
    protected void onDestroy() {
        stopTimer();
        super.onDestroy();
    }
}
