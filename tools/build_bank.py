#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build the shared Factronics TTO Lab question bank.

Outputs:
  assets/js/bank.js                 -> window.TTO_BANK (web, works from file://)
  android/app/src/main/assets/bank.json
  data/bank-preview.json
"""
from __future__ import annotations

import json
import math
import random
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LANGS = ("es", "en", "pt")
MODELS = json.loads((ROOT / "data" / "models.json").read_text(encoding="utf-8"))
MODEL_IDS = list(MODELS.keys())
ALL = list(MODEL_IDS)


def tr(es: str, en: str, pt: str) -> dict:
    return {"es": es, "en": en, "pt": pt}


def tget(d: dict, lang: str) -> str:
    return d.get(lang, d.get("es", ""))


def fmt(x, lang: str) -> str:
    if isinstance(x, float):
        s = f"{x:.2f}".rstrip("0").rstrip(".")
    else:
        s = str(x)
    return s.replace(".", ",") if lang in ("es", "pt") else s


UNIT = {
    "mm": tr("mm", "mm", "mm"),
    "m": tr("m", "m", "m"),
    "ppm": tr("ppm", "ppm", "ppm"),
    "mms": tr("mm/s", "mm/s", "mm/s"),
    "dpi": tr("ppp", "dpi", "dpi"),
    "in": tr("pulg", "in", "pol"),
    "ppmm": tr("impulsos/mm", "pulses/mm", "pulsos/mm"),
    "khz": tr("kHz", "kHz", "kHz"),
    "min": tr("min", "min", "min"),
    "h": tr("h", "h", "h"),
    "pct": tr("%", "%", "%"),
    "money": tr("USD", "USD", "USD"),
    "changes": tr("cambios", "changes", "trocas"),
}


def option_list(pairs, lang: str):
    return [{"id": oid, "text": (txt[lang] if isinstance(txt, dict) else txt)} for oid, txt in pairs]


def make_q(qid, qtype, models, diff, i18n, options=None, fields=None, rubric=None, answer=None,
           source="generated", tags=None):
    item = {
        "id": qid,
        "type": qtype,
        "models": [m for m in models if m in MODELS],
        "difficulty": diff,
        "source": source,
        "i18n": i18n,
    }
    if tags:
        item["tags"] = tags
    return item


def clean_models(text: str):
    found = [m for m in MODEL_IDS if re.search(rf"\b{m}\b", text)]
    if found:
        return found
    if "DataFlex" in text:
        return ["6320", "6330", "6420", "6530"]
    if "Serie 6000" in text or "6000 Series" in text or "Série 6000" in text:
        return ALL
    return ALL


OVERRIDES = {
    1: ["6330", "6530"], 2: ["6330", "6530"], 3: ["6330", "6530"],
    5: ["6230", "6330", "6530"], 7: ["6530"], 8: ["6530"], 9: ["6230"], 10: ["6530"],
    11: ["6330", "6530"], 13: ["6330", "6530"], 14: ["6230"], 17: ["6330", "6530"],
    18: ["6230"], 19: ["6330", "6530"], 20: ["6330"], 22: ["6330", "6530"], 23: ["6230"],
    31: ALL, 35: ["6230"], 36: ["6330", "6530"], 38: ["6330", "6530"],
    39: ["6320", "6330", "6420", "6530"], 41: ["6330", "6530"], 43: ["6330", "6530"],
    45: ["6230", "6330", "6530"], 48: ["6330"], 49: ["6330", "6530"],
    51: ["6330", "6530"], 55: ["6330", "6530"], 56: ["6230"], 58: ["6330"], 59: ["6530"],
    61: ["6330", "6530"], 62: ["6330", "6530"], 66: ["6330"], 67: ["6530"],
    68: ["6330", "6530"], 91: ["6230"], 92: ["6330", "6530"], 93: ["6330", "6530"],
    98: ["6330", "6530"], 100: ["6330"],
}


def legacy_item(q):
    sid = int(q["id"])
    typ = {"single": "single", "multi": "multi", "text": "fill", "short": "fill",
           "open": "describe" if q.get("s") == 4 else "errorfix"}[q["t"]]
    if typ == "fill" and 71 <= sid <= 80:
        typ = "calc"
    models = OVERRIDES.get(sid) or clean_models(q["q"]["es"])
    i18n = {}
    for lang in LANGS:
        d = {"q": q["q"][lang]}
        if sid == 41:
            d["q"] = {
                "es": "Los cabezales térmicos de 53 mm de la DataFlex 6330 y los de 53 y 107 mm de la DataFlex 6530 tienen una resolución nativa de ____________ ppp, lo que equivale a ____________ puntos por milímetro.",
                "en": "The 53 mm printhead on the DataFlex 6330 and the 53 and 107 mm printheads on the DataFlex 6530 have a native resolution of ____________ dpi, which equals ____________ dots per millimetre.",
                "pt": "Os cabeçotes térmicos de 53 mm da DataFlex 6330 e os de 53 e 107 mm da DataFlex 6530 têm uma resolução nativa de ____________ dpi, o que equivale a ____________ pontos por milímetro.",
            }[lang]
        if q["t"] in ("single", "multi"):
            d["options"] = [{"id": oid, "text": txt[lang]} for oid, txt in q["o"]]
            correct = q["a"] if isinstance(q["a"], list) else [q["a"]]
            d["answer"] = correct
        if q["t"] in ("text", "short"):
            fields = []
            for f in q["fields"]:
                answers = f.get("num") or f.get("accept") or []
                fields.append({
                    "label": f["label"][lang],
                    "unit": f.get("unit", ""),
                    "answers": answers,
                    "tolerance": f.get("tol", 0),
                })
            d["fields"] = fields
        if q["t"] == "open":
            d["model"] = q["model"][lang]
            d["rubric"] = [r[lang] for r in q["rubric"]]
        if q.get("ex"):
            d["explanation"] = q["ex"][lang]
        i18n[lang] = d
    return make_q(f"L{sid:03d}", typ, models, 1 if typ in ("single", "fill") else 2 if typ == "multi" else 3,
                  i18n, source="core")


# ---------------------------------------------------------------------------
# Generated specification questions
# ---------------------------------------------------------------------------

FACT_LABEL = {
    "width": tr("ancho máximo de impresión", "maximum print width", "largura máxima de impressão"),
    "ribbon": tr("capacidad máxima de ribbon", "maximum ribbon capacity", "capacidade máxima de ribbon"),
    "ppm": tr("rendimiento con código de 3 mm", "throughput with a 3 mm code", "rendimento com código de 3 mm"),
    "speedCont": tr("velocidad máxima en modo continuo", "maximum continuous speed", "velocidade máxima no modo contínuo"),
    "speedInt": tr("velocidad máxima en modo intermitente", "maximum intermittent speed", "velocidade máxima no modo intermitente"),
    "dpi": tr("resolución del cabezal", "printhead resolution", "resolução do cabeçote"),
    "air": tr("tipo de sistema de accionamiento", "actuation system type", "tipo de sistema de acionamento"),
    "ethernet": tr("conectividad Ethernet", "Ethernet connectivity", "conectividade Ethernet"),
    "screen": tr("tamaño de pantalla", "display size", "tamanho da tela"),
}

FACT_UNIT = {"width": "mm", "ribbon": "m", "ppm": "ppm", "speedCont": "mms",
             "speedInt": "mms", "dpi": "dpi", "air": "", "ethernet": "", "screen": "in"}

DISTRACTORS = {
    "width": [32, 53, 107, 150],
    "ribbon": [600, 700, 1200, 1500],
    "ppm": [125, 150, 250, 400, 450, 700],
    "speedCont": [500, 750, 800, 1000, 1200],
    "speedInt": [300, 500, 750, 800],
    "dpi": [150, 200, 300, 600],
    "screen": [5, 5.7, 8.4, 10.1],
}


def fact_value(model, fact):
    m = MODELS[model]
    if fact == "air":
        return "airless" if m["air"] == "airless" else "pneumatic"
    key = {"width": "maxWidth"}.get(fact, fact)
    return m[key]


def fact_text(model, fact, lang):
    v = fact_value(model, fact)
    if fact == "air":
        return {"es": "Airless (sin aire comprimido)" if v == "airless" else "Neumático (con aire comprimido)",
                "en": "Airless (no compressed air)" if v == "airless" else "Pneumatic (compressed air)",
                "pt": "Airless (sem ar comprimido)" if v == "airless" else "Pneumático (com ar comprimido)"}[lang]
    if fact == "ethernet":
        return {"es": "Sí" if v else "No", "en": "Yes" if v else "No", "pt": "Sim" if v else "Não"}[lang]
    unit = UNIT[FACT_UNIT[fact]][lang] if FACT_UNIT[fact] else ""
    return f"{fmt(v, lang)} {unit}".strip()


SINGLE_Q = {
    "width": [
        tr("¿Cuál es el ancho máximo de impresión de la {name}?",
           "What is the maximum print width of the {name}?",
           "Qual é a largura máxima de impressão da {name}?"),
        tr("En la ficha técnica de la {name}, el ancho máximo de cabezal disponible es de ____ mm. Elige el valor correcto.",
           "In the {name} datasheet, the maximum available printhead width is ____ mm. Choose the correct value.",
           "Na ficha técnica da {name}, a largura máxima de cabeçote disponível é ____ mm. Escolha o valor correto."),
    ],
    "ribbon": [
        tr("¿Qué longitud máxima de rollo de ribbon admite la {name}?",
           "What is the maximum ribbon roll length accepted by the {name}?",
           "Qual é o comprimento máximo de rolo de ribbon aceito pela {name}?"),
        tr("Al reponer consumible en una {name}, el rollo de mayor capacidad que puedes instalar es de ____ m.",
           "When replenishing consumables on a {name}, the largest roll you can install is ____ m.",
           "Ao repor consumível em uma {name}, o maior rolo que você pode instalar é de ____ m."),
    ],
    "ppm": [
        tr("¿Cuál es el rendimiento nominal de la {name} con un código de 3 mm?",
           "What is the rated throughput of the {name} with a 3 mm code?",
           "Qual é o rendimento nominal da {name} com um código de 3 mm?"),
        tr("En producción continua, la {name} alcanza aproximadamente ____ paquetes por minuto con un código de 3 mm.",
           "In continuous production, the {name} reaches approximately ____ packs per minute with a 3 mm code.",
           "Em produção contínua, a {name} atinge aproximadamente ____ pacotes por minuto com um código de 3 mm."),
    ],
    "speedCont": [
        tr("¿Cuál es la velocidad máxima en modo continuo de la {name}?",
           "What is the maximum continuous-mode speed of the {name}?",
           "Qual é a velocidade máxima no modo contínuo da {name}?"),
        tr("La {name} trabaja en continuo hasta ____ mm/s. Selecciona la velocidad correcta.",
           "The {name} runs continuously up to ____ mm/s. Select the correct speed.",
           "A {name} opera em contínuo até ____ mm/s. Selecione a velocidade correta."),
    ],
    "speedInt": [
        tr("¿Cuál es la velocidad máxima en modo intermitente de la {name}?",
           "What is the maximum intermittent-mode speed of the {name}?",
           "Qual é a velocidade máxima no modo intermitente da {name}?"),
    ],
    "dpi": [
        tr("¿Qué resolución nativa tienen los cabezales térmicos de la {name}?",
           "What native resolution do the thermal printheads of the {name} have?",
           "Qual é a resolução nativa dos cabeçotes térmicos da {name}?"),
        tr("Los cabezales de la {name} trabajan a ____ ppp de resolución nativa.",
           "The printheads on the {name} run at ____ dpi native resolution.",
           "Os cabeçotes da {name} trabalham a ____ dpi de resolução nativa."),
    ],
    "air": [
        tr("¿Qué tipo de sistema de accionamiento utiliza la {name}?",
           "What type of actuation system does the {name} use?",
           "Que tipo de sistema de acionamento a {name} utiliza?"),
        tr("Al instalar una {name}, ¿necesita aire comprimido para el movimiento del cabezal?",
           "When installing a {name}, does it need compressed air for printhead movement?",
           "Ao instalar uma {name}, ela precisa de ar comprimido para o movimento do cabeçote?"),
    ],
    "ethernet": [
        tr("¿La {name} incorpora conectividad Ethernet de serie?",
           "Does the {name} include Ethernet connectivity as standard?",
           "A {name} inclui conectividade Ethernet de série?"),
    ],
    "screen": [
        tr("¿De qué tamaño es la pantalla del controlador de la {name}?",
           "What is the controller display size on the {name}?",
           "Qual é o tamanho da tela do controlador da {name}?"),
        tr("El controlador de la {name} incorpora una pantalla de ____ pulgadas.",
           "The {name} controller includes a ____ inch display.",
           "O controlador da {name} inclui uma tela de ____ polegadas."),
    ],
}


def spec_single(model, fact, variant, seed):
    m = MODELS[model]
    name = m["name"]
    rng = random.Random(seed)
    if fact in ("air", "ethernet"):
        if fact == "air":
            if variant % 2 == 1:
                pairs = [("a", tr("Sí, requiere aire comprimido", "Yes, it needs compressed air", "Sim, precisa de ar comprimido")),
                         ("b", tr("No, es un sistema airless", "No, it is an airless system", "Não, é um sistema airless"))]
                correct = "a" if fact_value(model, fact) == "pneumatic" else "b"
            else:
                pairs = [("a", tr("Airless (sin aire comprimido)", "Airless (no compressed air)", "Airless (sem ar comprimido)")),
                         ("b", tr("Neumático (con aire comprimido)", "Pneumatic (compressed air)", "Pneumático (com ar comprimido)"))]
                correct = "a" if fact_value(model, fact) == "airless" else "b"
        else:
            pairs = [("a", tr("Sí", "Yes", "Sim")), ("b", tr("No", "No", "Não"))]
            correct = "a" if fact_value(model, fact) else "b"
    else:
        answer = fact_value(model, fact)
        values = [answer]
        for d in DISTRACTORS[fact]:
            if str(d) != str(answer) and d not in values:
                values.append(d)
        values = values[:4]
        rng.shuffle(values)
        pairs = []
        for i, v in enumerate(values):
            pairs.append((chr(97 + i), f"{fmt(v, 'es')} {UNIT[FACT_UNIT[fact]]['es']}".strip()))
        # Build language-specific labels later from numeric values
        correct = chr(97 + values.index(answer))
    template = SINGLE_Q[fact][variant % len(SINGLE_Q[fact])]
    i18n = {}
    for lang in LANGS:
        qtext = template[lang].format(name=name)
        d = {"q": qtext}
        if fact in ("air", "ethernet"):
            d["options"] = option_list(pairs, lang)
        else:
            opts = []
            for oid, txt in pairs:
                num = txt.split(" ")[0].replace(",", ".")
                try:
                    val = float(num)
                    val = int(val) if val == int(val) else val
                except ValueError:
                    val = txt
                unit = UNIT[FACT_UNIT[fact]][lang]
                opts.append({"id": oid, "text": f"{fmt(val, lang)} {unit}".strip()})
            d["options"] = opts
        d["answer"] = [correct]
        # explanation includes a comparison when another model really differs
        candidates = [x for x in MODEL_IDS if x != model and fact_value(x, fact) != fact_value(model, fact)]
        other = candidates[0] if candidates else None
        if fact in ("air", "ethernet"):
            if fact == "air":
                base = {
                    "es": f"La {name} es de accionamiento {fact_text(model, fact, 'es').lower()}.",
                    "en": f"The {name} uses {fact_text(model, fact, 'en').lower()}.",
                    "pt": f"A {name} utiliza {fact_text(model, fact, 'pt').lower()}.",
                }[lang]
            else:
                has = fact_value(model, fact)
                base = {
                    "es": f"La {name} {'sí incorpora' if has else 'no incorpora'} Ethernet de serie.",
                    "en": f"The {name} {'does' if has else 'does not'} include Ethernet as standard.",
                    "pt": f"A {name} {'inclui' if has else 'não inclui'} Ethernet de série.",
                }[lang]
            if other:
                if fact == "air":
                    base += {
                        "es": f" La {MODELS[other]['name']} es diferente: {fact_text(other, fact, 'es').lower()}.",
                        "en": f" The {MODELS[other]['name']} differs: {fact_text(other, fact, 'en').lower()}.",
                        "pt": f" A {MODELS[other]['name']} é diferente: {fact_text(other, fact, 'pt').lower()}.",
                    }[lang]
                else:
                    has_other = fact_value(other, fact)
                    base += {
                        "es": f" La {MODELS[other]['name']} {'sí la incluye' if has_other else 'no la incluye'}.",
                        "en": f" The {MODELS[other]['name']} {'does' if has_other else 'does not'} include it.",
                        "pt": f" A {MODELS[other]['name']} {'inclui' if has_other else 'não inclui'}.",
                    }[lang]
            d["explanation"] = base
        else:
            if other:
                d["explanation"] = {
                    "es": f"{FACT_LABEL[fact]['es'].capitalize()} de la {name}: {fact_text(model, fact, 'es')}. La {MODELS[other]['name']} registra {fact_text(other, fact, 'es')}; no conviene generalizar una especificación entre modelos.",
                    "en": f"{FACT_LABEL[fact]['en'].capitalize()} of the {name}: {fact_text(model, fact, 'en')}. The {MODELS[other]['name']} is {fact_text(other, fact, 'en')}; never generalise one model's specification across the family.",
                    "pt": f"{FACT_LABEL[fact]['pt'].capitalize()} da {name}: {fact_text(model, fact, 'pt')}. A {MODELS[other]['name']} registra {fact_text(other, fact, 'pt')}; não generalize uma especificação entre modelos.",
                }[lang]
            else:
                d["explanation"] = {
                    "es": f"{FACT_LABEL[fact]['es'].capitalize()} de la {name}: {fact_text(model, fact, 'es')}. Todos los modelos actuales de la familia comparten este valor.",
                    "en": f"{FACT_LABEL[fact]['en'].capitalize()} of the {name}: {fact_text(model, fact, 'en')}. All current models in the family share this value.",
                    "pt": f"{FACT_LABEL[fact]['pt'].capitalize()} da {name}: {fact_text(model, fact, 'pt')}. Todos os modelos atuais da família compartilham este valor.",
                }[lang]
        i18n[lang] = d
    return make_q(f"G-S-{model}-{fact}-{variant+1}", "single", [model], 1, i18n,
                  source="spec", tags=[fact])


MULTI_FACTS = ["width", "ribbon", "ppm", "speedCont", "speedInt", "dpi", "air", "ethernet", "screen"]


def spec_multi(model, variant, seed):
    rng = random.Random(seed)
    m = MODELS[model]
    facts = rng.sample(MULTI_FACTS, 4)
    statements = []
    truth = {}
    # Guarantee a mix: two true and two false statements.
    truth_flags = [True, True, False, False]
    rng.shuffle(truth_flags)
    for fact, is_true in zip(facts, truth_flags):
        truth[fact] = is_true
        if is_true:
            val = fact_value(model, fact)
        else:
            others = [x for x in MODEL_IDS if x != model and fact_value(x, fact) != fact_value(model, fact)]
            if others:
                val = fact_value(rng.choice(others), fact)
            elif fact in ("air", "ethernet"):
                val = not fact_value(model, fact)
            else:
                wrong = [x for x in DISTRACTORS.get(fact, []) if str(x) != str(fact_value(model, fact))]
                val = rng.choice(wrong) if wrong else fact_value(model, fact)
        statements.append((fact, val, is_true))
    rng.shuffle(statements)
    pairs = []
    correct = []
    for i, (fact, val, is_true) in enumerate(statements):
        oid = chr(97 + i)
        if fact == "air":
            txt = tr("Sistema airless (sin aire comprimido)", "Airless system (no compressed air)", "Sistema airless (sem ar comprimido)") if val == "airless" else tr("Sistema neumático (con aire comprimido)", "Pneumatic system (compressed air)", "Sistema pneumático (com ar comprimido)")
        elif fact == "ethernet":
            txt = tr("Conectividad Ethernet de serie", "Ethernet connectivity as standard", "Conectividade Ethernet de série") if val else tr("Sin conectividad Ethernet", "No Ethernet connectivity", "Sem conectividade Ethernet")
        else:
            txt = {
                "es": f"{FACT_LABEL[fact]['es'].capitalize()}: {fmt(val, 'es')} {UNIT[FACT_UNIT[fact]]['es']}".strip(),
                "en": f"{FACT_LABEL[fact]['en'].capitalize()}: {fmt(val, 'en')} {UNIT[FACT_UNIT[fact]]['en']}".strip(),
                "pt": f"{FACT_LABEL[fact]['pt'].capitalize()}: {fmt(val, 'pt')} {UNIT[FACT_UNIT[fact]]['pt']}".strip(),
            }
        pairs.append((oid, txt))
        if is_true:
            correct.append(oid)
    i18n = {}
    q_variants = {
        0: tr("Selecciona todas las afirmaciones que corresponden a la {name}.",
              "Select every statement that applies to the {name}.",
              "Selecione todas as afirmações que correspondem à {name}."),
        1: tr("Marca todas las afirmaciones verdaderas para la {name}.",
              "Tick every true statement for the {name}.",
              "Marque todas as afirmações verdadeiras para a {name}."),
    }
    for lang in LANGS:
        i18n[lang] = {
            "q": q_variants[variant % 2][lang].format(name=m["name"]),
            "options": option_list(pairs, lang),
            "answer": correct,
            "explanation": {
                "es": "Datos reales: " + "; ".join(f"{FACT_LABEL[f]['es']} = {fact_text(model, f, 'es')}" for f in MULTI_FACTS if f in facts) + ".",
                "en": "Actual data: " + "; ".join(f"{FACT_LABEL[f]['en']} = {fact_text(model, f, 'en')}" for f in MULTI_FACTS if f in facts) + ".",
                "pt": "Dados reais: " + "; ".join(f"{FACT_LABEL[f]['pt']} = {fact_text(model, f, 'pt')}" for f in MULTI_FACTS if f in facts) + ".",
            }[lang],
        }
    return make_q(f"G-M-{model}-{variant+1}", "multi", [model], 2, i18n, source="spec")


def field(label, unit, answers, tol=0):
    return {"label": label, "unit": unit, "answers": answers, "tolerance": tol}


def spec_fill(model, variant, seed):
    m = MODELS[model]
    name = m["name"]
    if variant == 0:
        q = tr(
            "Auditoría de línea: el técnico confirma que la {name} admite un rollo de ribbon de hasta ____ m y que su cabezal de mayor ancho es de ____ mm.",
            "Line audit: the technician confirms that the {name} accepts a ribbon roll of up to ____ m and that its widest printhead is ____ mm.",
            "Auditoria de linha: o técnico confirma que a {name} aceita um rolo de ribbon de até ____ m e que seu cabeçote de maior largura é de ____ mm.",
        )
        data = {"ribbon": m["ribbon"], "maxWidth": m["maxWidth"]}
        labels = [tr("Rollo máximo", "Maximum roll", "Rolo máximo"), tr("Ancho máximo", "Maximum width", "Largura máxima")]
        units = ["m", "mm"]
    elif variant == 1:
        q = tr(
            "En una prueba de rendimiento, la {name} se configura con código de 3 mm y alcanza ____ ppm; en modo continuo su velocidad máxima es ____ mm/s.",
            "In a throughput test, the {name} is set up with a 3 mm code and reaches ____ ppm; in continuous mode its maximum speed is ____ mm/s.",
            "Em um teste de rendimento, a {name} é configurada com código de 3 mm e atinge ____ ppm; no modo contínuo sua velocidade máxima é ____ mm/s.",
        )
        data = {"ppm": m["ppm"], "speedCont": m["speedCont"]}
        labels = [tr("Rendimiento", "Throughput", "Rendimento"), tr("Velocidad continua", "Continuous speed", "Velocidade contínua")]
        units = ["ppm", "mm/s"]
    else:
        q = tr(
            "El sistema de accionamiento de la {name} es de tipo ____ y sus cabezales trabajan a ____ ppp de resolución nativa.",
            "The actuation system of the {name} is ____ and its printheads run at ____ dpi native resolution.",
            "O sistema de acionamento da {name} é do tipo ____ e seus cabeçotes trabalham a ____ dpi de resolução nativa.",
        )
        data = {"air": "airless" if m["air"] == "airless" else "neumático", "dpi": m["dpi"]}
        labels = [tr("Sistema", "System", "Sistema"), tr("Resolución", "Resolution", "Resolução")]
        units = ["", "ppp"]
    i18n = {}
    for lang in LANGS:
        fields = []
        if variant == 2:
            fields.append(field(labels[0][lang], "", ["airless", "sin aire", "sem ar"] if m["air"] == "airless" else ["neumatico", "neumático", "pneumatic", "pneumático"], 0))
            fields.append(field(labels[1][lang], "ppp", [m["dpi"]], 0.1))
        else:
            fields.append(field(labels[0][lang], units[0], [data[list(data)[0]]], 0.1))
            fields.append(field(labels[1][lang], units[1], [data[list(data)[1]]], 0.1))
        i18n[lang] = {
            "q": q[lang].format(name=name),
            "fields": fields,
            "explanation": {
                "es": f"Ficha de la {name}: rollo {m['ribbon']} m, ancho máximo {m['maxWidth']} mm, rendimiento {m['ppm']} ppm, continuo {m['speedCont']} mm/s, {fact_text(model, 'air', 'es')}, {m['dpi']} ppp.",
                "en": f"{name} datasheet: {m['ribbon']} m roll, maximum width {m['maxWidth']} mm, throughput {m['ppm']} ppm, continuous {m['speedCont']} mm/s, {fact_text(model, 'air', 'en')}, {m['dpi']} dpi.",
                "pt": f"Ficha da {name}: rolo {m['ribbon']} m, largura máxima {m['maxWidth']} mm, rendimento {m['ppm']} ppm, contínuo {m['speedCont']} mm/s, {fact_text(model, 'air', 'pt')}, {m['dpi']} dpi.",
            }[lang],
        }
    return make_q(f"G-F-{model}-{variant+1}", "fill", [model], 1, i18n, source="spec")


# ---------------------------------------------------------------------------
# Calculation engine
# ---------------------------------------------------------------------------

def calc_item(fid, models, difficulty, body_es, body_en, body_pt, fields, explanation, tags):
    i18n = {}
    for lang in LANGS:
        body = {"es": body_es, "en": body_en, "pt": body_pt}[lang]
        i18n[lang] = {
            "q": body,
            "fields": [
                field(f["label"][lang], f.get("unit", ""), f["answers"], f.get("tol", 0))
                for f in fields
            ],
            "explanation": explanation[lang],
        }
    return make_q(fid, "calc", models, difficulty, i18n, source="calc", tags=tags)


def build_calcs():
    out = []
    rng = random.Random(20261022)
    # 1. Encoder pulses per mm
    for i in range(12):
        ppr = rng.choice([2500, 3600, 5000])
        wheel = rng.choice([50.0, 53.05, 60.0])
        ppmm = ppr / (math.pi * wheel)
        out.append(calc_item(
            f"C-ENC-{i+1}", ["6230", "6330", "6530"], 2,
            f"Un encoder óptico de {ppr} PPR gira sobre una rueda de medición de {fmt(wheel,'es')} mm de diámetro. ¿Cuántos impulsos se generan por milímetro de película?",
            f"An optical encoder with {ppr} PPR turns on a measuring wheel of {fmt(wheel,'en')} mm diameter. How many pulses are generated per millimetre of film?",
            f"Um encoder óptico de {ppr} PPR gira sobre uma roda de medição de {fmt(wheel,'pt')} mm de diâmetro. Quantos pulsos são gerados por milímetro de filme?",
            [{"label": tr("Impulsos por mm", "Pulses per mm", "Pulsos por mm"), "unit": "impulsos/mm", "answers": [round(ppmm, 3)], "tol": 0.03}],
            {
                "es": f"Perímetro = π × D = π × {fmt(wheel,'es')} = {fmt(math.pi*wheel,'es')} mm.\nResolución = {ppr} ÷ {fmt(math.pi*wheel,'es')} = {fmt(ppmm,'es')} impulsos/mm.",
                "en": f"Circumference = π × D = π × {fmt(wheel,'en')} = {fmt(math.pi*wheel,'en')} mm.\nResolution = {ppr} ÷ {fmt(math.pi*wheel,'en')} = {fmt(ppmm,'en')} pulses/mm.",
                "pt": f"Perímetro = π × D = π × {fmt(wheel,'pt')} = {fmt(math.pi*wheel,'pt')} mm.\nResolução = {ppr} ÷ {fmt(math.pi*wheel,'pt')} = {fmt(ppmm,'pt')} pulsos/mm.",
            }, ["encoder"]))
    # 2. Encoder frequency
    for i in range(12):
        speed = rng.choice([300, 400, 500, 600, 750, 800, 1000])
        ppmm = rng.choice([12, 18, 21.6, 25, 30])
        khz = speed * ppmm / 1000
        out.append(calc_item(
            f"C-FRQ-{i+1}", ["6230", "6330", "6530"], 2,
            f"La línea avanza a {speed} mm/s y el encoder entrega {fmt(ppmm,'es')} impulsos/mm. ¿Qué frecuencia de impulsos, en kHz, debe procesar la tarjeta principal?",
            f"The line runs at {speed} mm/s and the encoder delivers {fmt(ppmm,'en')} pulses/mm. What pulse frequency, in kHz, must the main board process?",
            f"A linha avança a {speed} mm/s e o encoder fornece {fmt(ppmm,'pt')} pulsos/mm. Que frequência de pulsos, em kHz, a placa principal deve processar?",
            [{"label": tr("Frecuencia", "Frequency", "Frequência"), "unit": "kHz", "answers": [round(khz, 2)], "tol": 0.1}],
            {
                "es": f"f = velocidad × resolución = {speed} mm/s × {fmt(ppmm,'es')} impulsos/mm = {fmt(speed*ppmm,'es')} Hz.\nEn kHz: {fmt(speed*ppmm,'es')} ÷ 1000 = {fmt(khz,'es')} kHz.",
                "en": f"f = speed × resolution = {speed} mm/s × {fmt(ppmm,'en')} pulses/mm = {fmt(speed*ppmm,'en')} Hz.\nIn kHz: {fmt(speed*ppmm,'en')} ÷ 1000 = {fmt(khz,'en')} kHz.",
                "pt": f"f = velocidade × resolução = {speed} mm/s × {fmt(ppmm,'pt')} pulsos/mm = {fmt(speed*ppmm,'pt')} Hz.\nEm kHz: {fmt(speed*ppmm,'pt')} ÷ 1000 = {fmt(khz,'pt')} kHz.",
            }, ["encoder", "frequency"]))
    # 3. Ribbon autonomy
    for i in range(12):
        length = rng.choice([600, 700, 1200])
        rate = rng.choice([4.5, 5.0, 5.5, 6.0, 7.38, 8.0, 9.0, 10.0, 12.0])
        minutes = length / rate
        hours = minutes / 60
        out.append(calc_item(
            f"C-AUT-{i+1}", ["6210", "6230", "6320", "6330", "6420", "6530"], 2,
            f"Un rollo de ribbon de {length} m se consume a {fmt(rate,'es')} m/minuto. Calcula su autonomía total en minutos y en horas de producción continua.",
            f"A {length} m ribbon roll is consumed at {fmt(rate,'en')} m/min. Calculate its total autonomy in minutes and in hours of continuous production.",
            f"Um rolo de ribbon de {length} m é consumido a {fmt(rate,'pt')} m/minuto. Calcule sua autonomia total em minutos e em horas de produção contínua.",
            [
                {"label": tr("Minutos", "Minutes", "Minutos"), "unit": "min", "answers": [round(minutes, 1)], "tol": 0.5},
                {"label": tr("Horas", "Hours", "Horas"), "unit": "h", "answers": [round(hours, 2)], "tol": 0.02},
            ],
            {
                "es": f"t = longitud ÷ consumo = {length} ÷ {fmt(rate,'es')} = {fmt(minutes,'es')} min.\nEn horas: {fmt(minutes,'es')} ÷ 60 = {fmt(hours,'es')} h.",
                "en": f"t = length ÷ consumption = {length} ÷ {fmt(rate,'en')} = {fmt(minutes,'en')} min.\nIn hours: {fmt(minutes,'en')} ÷ 60 = {fmt(hours,'en')} h.",
                "pt": f"t = comprimento ÷ consumo = {length} ÷ {fmt(rate,'pt')} = {fmt(minutes,'pt')} min.\nEm horas: {fmt(minutes,'pt')} ÷ 60 = {fmt(hours,'pt')} h.",
            }, ["ribbon", "autonomy"]))
    # 4. Daily consumption and rolls
    for i in range(12):
        ppm = rng.choice([100, 125, 150, 200, 250, 400])
        hours = rng.choice([8, 12, 16, 24])
        advance = rng.choice([25, 30, 35, 40, 45, 50])
        roll = 1200
        total = ppm * 60 * hours * advance / 1000
        rolls = math.ceil(total / roll)
        out.append(calc_item(
            f"C-DAY-{i+1}", ["6230", "6330", "6420", "6530"], 2,
            f"Una línea produce {ppm} ppm durante {hours} h y avanza {advance} mm de ribbon por impresión. ¿Cuántos metros consume y cuántos rollos de {roll} m necesita?",
            f"A line produces {ppm} ppm for {hours} h and advances {advance} mm of ribbon per print. How many metres does it consume and how many {roll} m rolls are needed?",
            f"Uma linha produz {ppm} ppm durante {hours} h e avança {advance} mm de ribbon por impressão. Quantos metros consome e quantos rolos de {roll} m são necessários?",
            [
                {"label": tr("Consumo", "Consumption", "Consumo"), "unit": "m", "answers": [round(total, 1)], "tol": 1},
                {"label": tr("Rollos", "Rolls", "Rolos"), "unit": "", "answers": [rolls, round(total / roll, 2)], "tol": 0},
            ],
            {
                "es": f"Impresiones = {ppm} × 60 × {hours} = {ppm*60*hours}.\nConsumo = {ppm*60*hours} × {advance} mm ÷ 1000 = {fmt(total,'es')} m.\nRollos = {fmt(total,'es')} ÷ {roll} = {fmt(total/roll,'es')} → se necesitan {rolls}.",
                "en": f"Prints = {ppm} × 60 × {hours} = {ppm*60*hours}.\nConsumption = {ppm*60*hours} × {advance} mm ÷ 1000 = {fmt(total,'en')} m.\nRolls = {fmt(total,'en')} ÷ {roll} = {fmt(total/roll,'en')} → {rolls} required.",
                "pt": f"Impressões = {ppm} × 60 × {hours} = {ppm*60*hours}.\nConsumo = {ppm*60*hours} × {advance} mm ÷ 1000 = {fmt(total,'pt')} m.\nRolos = {fmt(total,'pt')} ÷ {roll} = {fmt(total/roll,'pt')} → são necessários {rolls}.",
            }, ["ribbon", "consumption"]))
    # 5. Prints per minute from speed and length
    for i in range(12):
        speed = rng.choice([500, 750, 800, 1000])
        length = rng.choice([50, 68, 75, 100, 135, 200])
        ppm = speed * 60 / length
        out.append(calc_item(
            f"C-PPM-{i+1}", ["6210", "6230", "6320", "6330", "6420", "6530"], 2,
            f"Una impresora trabaja a {speed} mm/s y cada impresión ocupa {length} mm de película. ¿Cuál es el máximo teórico de impresiones por minuto?",
            f"A printer runs at {speed} mm/s and each print occupies {length} mm of film. What is the theoretical maximum prints per minute?",
            f"Uma impressora trabalha a {speed} mm/s e cada impressão ocupa {length} mm de filme. Qual é o máximo teórico de impressões por minuto?",
            [{"label": tr("Impresiones por minuto", "Prints per minute", "Impressões por minuto"), "unit": "ppm", "answers": [round(ppm, 1)], "tol": 0.5}],
            {
                "es": f"En un minuto la película avanza {speed} × 60 = {speed*60} mm.\nImpresiones = {speed*60} ÷ {length} = {fmt(ppm,'es')} ppm.",
                "en": f"In one minute the film advances {speed} × 60 = {speed*60} mm.\nPrints = {speed*60} ÷ {length} = {fmt(ppm,'en')} ppm.",
                "pt": f"Em um minuto o filme avança {speed} × 60 = {speed*60} mm.\nImpressões = {speed*60} ÷ {length} = {fmt(ppm,'pt')} ppm.",
            }, ["throughput"]))
    # 6. Dots per mm
    for i in range(10):
        dpi = rng.choice([300, 600])
        dpmm = dpi / 25.4
        out.append(calc_item(
            f"C-DOT-{i+1}", ALL, 1,
            f"Un cabezal tiene una resolución de {dpi} ppp. ¿Cuántos puntos por milímetro representa? Usa 1 pulgada = 25,4 mm.",
            f"A printhead has a resolution of {dpi} dpi. How many dots per millimetre is that? Use 1 inch = 25.4 mm.",
            f"Um cabeçote tem resolução de {dpi} dpi. Quantos pontos por milímetro isso representa? Use 1 polegada = 25,4 mm.",
            [{"label": tr("Puntos por mm", "Dots per mm", "Pontos por mm"), "unit": "puntos/mm", "answers": [round(dpmm, 2)], "tol": 0.05}],
            {
                "es": f"{dpi} ppp ÷ 25,4 mm/pulg = {fmt(dpmm,'es')} puntos/mm.",
                "en": f"{dpi} dpi ÷ 25.4 mm/in = {fmt(dpmm,'en')} dots/mm.",
                "pt": f"{dpi} dpi ÷ 25,4 mm/pol = {fmt(dpmm,'pt')} pontos/mm.",
            }, ["resolution"]))
    # 7. Ribbon saving
    for i in range(10):
        label = rng.choice([75, 100, 120, 150, 200])
        b1 = rng.choice([15, 20, 25, 30, 40])
        b2 = rng.choice([10, 15, 20, 25, 30])
        saved = (label - b1 - b2) / label * 100
        out.append(calc_item(
            f"C-SAV-{i+1}", ["6330", "6530", "6420"], 3,
            f"Una etiqueta de {label} mm se imprime con Intermittent Stripes: dos bloques de {b1} mm y {b2} mm separados por espacios sin imprimir. ¿Qué porcentaje de ribbon se ahorra frente a imprimir toda la etiqueta?",
            f"A {label} mm label is printed with Intermittent Stripes: two blocks of {b1} mm and {b2} mm separated by unprinted gaps. What percentage of ribbon is saved versus printing the whole label?",
            f"Uma etiqueta de {label} mm é impressa com Intermittent Stripes: dois blocos de {b1} mm e {b2} mm separados por espaços sem impressão. Qual percentual de ribbon é economizado em relação a imprimir toda a etiqueta?",
            [{"label": tr("Ahorro", "Saving", "Economia"), "unit": "%", "answers": [round(saved, 1)], "tol": 0.5}],
            {
                "es": f"Longitud impresa = {b1} + {b2} = {b1+b2} mm.\nAhorro = ({label} − {b1+b2}) ÷ {label} × 100 = {fmt(saved,'es')} %.",
                "en": f"Printed length = {b1} + {b2} = {b1+b2} mm.\nSaving = ({label} − {b1+b2}) ÷ {label} × 100 = {fmt(saved,'en')} %.",
                "pt": f"Comprimento impresso = {b1} + {b2} = {b1+b2} mm.\nEconomia = ({label} − {b1+b2}) ÷ {label} × 100 = {fmt(saved,'pt')} %.",
            }, ["ribbon", "saving"]))
    # 8. Cost per 1000 prints
    for i in range(10):
        advance = rng.choice([25, 30, 35, 40, 50])
        roll = rng.choice([600, 700, 1200])
        price = rng.choice([35, 42, 50, 65, 80])
        cost = (advance / 1000) / roll * 1000 * price
        out.append(calc_item(
            f"C-CST-{i+1}", ALL, 3,
            f"Un rollo de {roll} m cuesta {price} USD. Cada impresión avanza {advance} mm de ribbon. ¿Cuál es el costo de ribbon por 1000 impresiones?",
            f"A {roll} m roll costs USD {price}. Each print advances {advance} mm of ribbon. What is the ribbon cost per 1000 prints?",
            f"Um rolo de {roll} m custa {price} USD. Cada impressão avança {advance} mm de ribbon. Qual é o custo de ribbon por 1000 impressões?",
            [{"label": tr("Costo por 1000", "Cost per 1000", "Custo por 1000"), "unit": "USD", "answers": [round(cost, 2)], "tol": 0.05}],
            {
                "es": f"Consumo por 1000 impresiones = 1000 × {advance} mm = {advance} m.\nCosto = ({advance} ÷ {roll}) × {price} = {fmt(cost,'es')} USD.",
                "en": f"Consumption per 1000 prints = 1000 × {advance} mm = {advance} m.\nCost = ({advance} ÷ {roll}) × {price} = {fmt(cost,'en')} USD.",
                "pt": f"Consumo por 1000 impressões = 1000 × {advance} mm = {advance} m.\nCusto = ({advance} ÷ {roll}) × {price} = {fmt(cost,'pt')} USD.",
            }, ["cost"]))
    return out


# ---------------------------------------------------------------------------
# Error-code questions
# ---------------------------------------------------------------------------

ERRORS = [
    ("E3236", ["6330", "6530"], tr("Error de posición del carro del cabezal", "Printhead carriage position error", "Erro de posição do carro do cabeçote"),
     tr("Correa destensada o desalineada; el encoder de posición pierde sincronismo con el motor del carro.", "Slack or misaligned belt; the position encoder loses synchronism with the carriage motor.", "Correia frouxa ou desalinhada; o encoder de posição perde sincronismo com o motor do carro."),
     tr("Calibrar la correa a 10 kg con el kit 407954, revisar encoders y el libre recorrido del carro.", "Set belt tension to 10 kg with kit 407954, check encoders and free carriage travel.", "Calibrar a correia a 10 kg com o kit 407954, verificar encoders e o livre curso do carro.")),
    ("E3237", ["6330", "6530"], tr("Tamaño de carrete incorrecto", "Incorrect reel size", "Tamanho de carretel incorreto"),
     tr("El largo o ancho de ribbon configurado no coincide con el rollo instalado, o el buje desliza en el mandril.", "Configured ribbon length or width does not match the installed roll, or the core slips on the mandrel.", "O comprimento ou largura de ribbon configurado não corresponde ao rolo instalado, ou o tubete desliza no mandril."),
     tr("Verificar software r04SP2 o superior, largo/ancho en Consumibles y resortes de hoja del mandril.", "Check software r04SP2 or later, length/width under Consumables and mandrel leaf springs.", "Verificar software r04SP2 ou superior, comprimento/largura em Consumíveis e molas de lâmina do mandril.")),
    ("E3337", ["6230"], tr("Falla del actuador o del electroimán del cabezal", "Printhead actuator or electromagnet failure", "Falha do atuador ou eletroímã do cabeçote"),
     tr("Electroimán 408291, microswitch de home 408274, resorte roto u obstrucción del brazo del cabezal.", "Electromagnet 408291, home microswitch 408274, broken spring or obstruction of the printhead arm.", "Eletroímã 408291, microswitch de home 408274, mola quebrada ou obstrução do braço do cabeçote."),
     tr("Inspeccionar el recorrido, medir la bobina y sustituir el conjunto 408291 si no responde.", "Inspect travel, check the coil and replace assembly 408291 if it does not respond.", "Inspecionar o curso, medir a bobina e substituir o conjunto 408291 se não responder.")),
    ("E3017", ALL, tr("Error de detección de velocidad del sustrato / encoder", "Substrate speed or encoder detection error", "Erro de detecção de velocidade do substrato / encoder"),
     tr("Encoder desconectado, rueda patinando, resolución mal configurada o velocidad fuera del rango permitido.", "Encoder disconnected, wheel slipping, wrong resolution or speed outside the allowed range.", "Encoder desconectado, roda patinando, resolução mal configurada ou velocidade fora da faixa permitida."),
     tr("Revisar conector y rueda del encoder, confirmar resolución y respetar el mínimo de 40 mm/s en continuo.", "Check encoder connector and wheel, confirm resolution and respect the 40 mm/s continuous minimum.", "Verificar conector e roda do encoder, confirmar resolução e respeitar o mínimo de 40 mm/s em contínuo.")),
    ("E3018", ALL, tr("Ribbon Pull Through: el ribbon se desplaza sin control", "Ribbon Pull Through: ribbon is pulled through uncontrolled", "Ribbon Pull Through: o ribbon se desloca sem controle"),
     tr("El cabezal no sujeta el ribbon, la tensión está mal calibrada o el rollo no está bien asentado.", "The printhead does not grip the ribbon, tension is misadjusted or the roll is not seated correctly.", "O cabeçote não prende o ribbon, a tensão está mal calibrada ou o rolo não está bem assentado."),
     tr("Revisar cierre del cabezal, tensión y asentamiento del rollo; sustituir el casete si el eje patina.", "Check printhead closure, tension and roll seating; replace the cassette if the shaft slips.", "Verificar fechamento do cabeçote, tensão e assentamento do rolo; substituir o cassete se o eixo patinar.")),
    ("E3322", ALL, tr("Señal de impresión ignorada", "Print signal ignored", "Sinal de impressão ignorado"),
     tr("El trigger llega cuando la velocidad del sustrato es inferior a 40 mm/s o el tiempo entre disparos es inválido.", "The trigger arrives when substrate speed is below 40 mm/s or the time between triggers is invalid.", "O trigger chega quando a velocidade do substrato é inferior a 40 mm/s ou o tempo entre disparos é inválido."),
     tr("Aumentar la velocidad por encima del mínimo, revisar el sensor de trigger y la configuración de modo.", "Raise speed above the minimum, check the trigger sensor and mode configuration.", "Aumentar a velocidade acima do mínimo, verificar o sensor de trigger e a configuração de modo.")),
    ("E3236-6420", ["6420", "6320"], tr("Pérdida de posición del carro en DataFlex", "Carriage position loss on DataFlex", "Perda de posição do carro na DataFlex"),
     tr("Correa del carro destensada o sucia; en 6420/6320 se ajusta a 9 kg y se lubrica la guía con 402113.", "Slack or dirty carriage belt; on 6420/6320 set 9 kg and lubricate the slide with 402113.", "Correia do carro frouxa ou suja; na 6420/6320 ajusta-se a 9 kg e lubrifica-se a guia com 402113."),
     tr("Ajustar a 9 kg, limpiar/lubricar la guía, revisar la PCB 402810 si persiste.", "Set 9 kg, clean/lubricate the slide, check PCB 402810 if it persists.", "Ajustar a 9 kg, limpar/lubrificar a guia, verificar a PCB 402810 se persistir.")),
]


def build_errmap():
    out = []
    for idx, (code, models, meaning, cause, action) in enumerate(ERRORS):
        pairs = [("a", meaning)]
        for j, (_, _, other, _, _) in enumerate(ERRORS):
            if j != idx and len(pairs) < 4 and other["es"] != meaning["es"]:
                pairs.append((chr(97 + len(pairs)), other))
        i18n = {}
        for lang in LANGS:
            i18n[lang] = {
                "q": {
                    "es": f"¿Qué significa el código de falla {code}?",
                    "en": f"What does fault code {code} mean?",
                    "pt": f"O que significa o código de falha {code}?",
                }[lang],
                "options": [{"id": oid, "text": txt[lang]} for oid, txt in pairs],
                "answer": ["a"],
                "explanation": {
                    "es": f"{code}: {meaning['es']}.\nCausa típica: {cause['es']}\nAcción: {action['es']}",
                    "en": f"{code}: {meaning['en']}.\nTypical cause: {cause['en']}\nAction: {action['en']}",
                    "pt": f"{code}: {meaning['pt']}.\nCausa típica: {cause['pt']}\nAção: {action['pt']}",
                }[lang],
            }
        out.append(make_q(f"E-{code}", "errmap", models, 2, i18n, source="error"))
    return out


# ---------------------------------------------------------------------------
# Extra static items for legacy models
# ---------------------------------------------------------------------------

def extra_statics():
    out = []
    # 6210
    i18n = {}
    for lang in LANGS:
        i18n[lang] = {
            "q": {
                "es": "¿Qué diferencia clave separa a la Videojet 6210 de la 6230 en cuanto a accionamiento del cabezal?",
                "en": "What key difference separates the Videojet 6210 from the 6230 regarding printhead actuation?",
                "pt": "Qual diferença principal separa a Videojet 6210 da 6230 quanto ao acionamento do cabeçote?",
            }[lang],
            "options": [
                {"id": "a", "text": {"es": "La 6210 es neumática; la 6230 es airless con electroimán.", "en": "The 6210 is pneumatic; the 6230 is airless with an electromagnet.", "pt": "A 6210 é pneumática; a 6230 é airless com eletroímã."}[lang]},
                {"id": "b", "text": {"es": "La 6210 es airless; la 6230 usa aire comprimido.", "en": "The 6210 is airless; the 6230 uses compressed air.", "pt": "A 6210 é airless; a 6230 usa ar comprimido."}[lang]},
                {"id": "c", "text": {"es": "Ambas son airless y comparten el mismo actuador.", "en": "Both are airless and share the same actuator.", "pt": "Ambas são airless e compartilham o mesmo atuador."}[lang]},
                {"id": "d", "text": {"es": "Ninguna usa accionamiento electromecánico.", "en": "Neither uses electromechanical actuation.", "pt": "Nenhuma usa acionamento eletromecânico."}[lang]},
            ],
            "answer": ["a"],
            "explanation": {
                "es": "La 6210 es la plataforma neumática anterior (0,30 MPa). La 6230 introdujo el accionamiento airless con electroimán 408291 y microswitch de home 408274.",
                "en": "The 6210 is the earlier pneumatic platform (0.30 MPa). The 6230 introduced airless actuation with electromagnet 408291 and home microswitch 408274.",
                "pt": "A 6210 é a plataforma pneumática anterior (0,30 MPa). A 6230 introduziu o acionamento airless com eletroímã 408291 e microswitch de home 408274.",
            }[lang],
        }
    out.append(make_q("X-6210-1", "single", ["6210", "6230"], 2, i18n, source="legacy"))

    # 6420 belt / PCB
    i18n = {}
    for lang in LANGS:
        i18n[lang] = {
            "q": {
                "es": "En una DataFlex 6420, ¿a qué valor se ajusta la tensión de la correa del carro y qué kit de lubricación se usa en la guía?",
                "en": "On a DataFlex 6420, what belt tension is set for the carriage and which lubrication kit is used on the slide?",
                "pt": "Em uma DataFlex 6420, a que valor se ajusta a tensão da correia do carro e qual kit de lubrificação é usado na guia?",
            }[lang],
            "options": [
                {"id": "a", "text": {"es": "9 kg y kit 402113", "en": "9 kg and kit 402113", "pt": "9 kg e kit 402113"}[lang]},
                {"id": "b", "text": {"es": "10 kg y kit 407954", "en": "10 kg and kit 407954", "pt": "10 kg e kit 407954"}[lang]},
                {"id": "c", "text": {"es": "8 kg y kit 408309", "en": "8 kg and kit 408309", "pt": "8 kg e kit 408309"}[lang]},
                {"id": "d", "text": {"es": "12 kg y kit 216054", "en": "12 kg and kit 216054", "pt": "12 kg e kit 216054"}[lang]},
            ],
            "answer": ["a"],
            "explanation": {
                "es": "En la plataforma 6420/6320 la correa se ajusta a 9 kg ±1 kg y la guía se lubrica con el kit 402113. La PCB del 6420 es 402810. No confundir con los 10 kg de la 6330/6530 ni con los 8 kg de la 6230.",
                "en": "On the 6420/6320 platform the belt is set to 9 kg ±1 kg and the slide is lubricated with kit 402113. The 6420 PCB is 402810. Do not confuse this with 10 kg on the 6330/6530 or 8 kg on the 6230.",
                "pt": "Na plataforma 6420/6320 a correia é ajustada a 9 kg ±1 kg e a guia é lubrificada com o kit 402113. A PCB da 6420 é 402810. Não confundir com os 10 kg da 6330/6530 nem com os 8 kg da 6230.",
            }[lang],
        }
    out.append(make_q("X-6420-1", "single", ["6420", "6320"], 2, i18n, source="legacy"))

    # 6210 parts open
    i18n = {}
    for lang in LANGS:
        i18n[lang] = {
            "q": {
                "es": "Describe el controlador CLARiTY de la Videojet 6210: función, pantalla, números de parte de la PCB y del conjunto LCD/táctil, y una limitación de conectividad.",
                "en": "Describe the Videojet 6210 CLARiTY controller: function, display, PCB and LCD/touch assembly part numbers, and one connectivity limitation.",
                "pt": "Descreva o controlador CLARiTY da Videojet 6210: função, tela, números de peça da PCB e do conjunto LCD/touch, e uma limitação de conectividade.",
            }[lang],
            "model": {
                "es": "El controlador CLARiTY es un módulo separado que ejecuta el software, almacena mensajes y gobierna la impresora 6210.\nPantalla: 5,7\" en color QVGA CSTN, 240 × 320 px, táctil.\nPCB: P/N 403344. Conjunto LCD y táctil: P/N 403345.\nLimitación: la 6210 no incorpora Ethernet ni servidor web; la comunicación con PC es por RS232 o puerto USB para cargar mensajes.",
                "en": "The CLARiTY controller is a separate module that runs the software, stores messages and controls the 6210 printer.\nDisplay: 5.7\" colour QVGA CSTN, 240 × 320 px, touchscreen.\nPCB: P/N 403344. LCD and touch assembly: P/N 403345.\nLimitation: the 6210 has no Ethernet or web server; PC communication is via RS232 or the USB port for loading messages.",
                "pt": "O controlador CLARiTY é um módulo separado que executa o software, armazena mensagens e governa a impressora 6210.\nTela: 5,7\" colorida QVGA CSTN, 240 × 320 px, touch.\nPCB: P/N 403344. Conjunto LCD e touch: P/N 403345.\nLimitação: a 6210 não possui Ethernet nem servidor web; a comunicação com PC é por RS232 ou porta USB para carregar mensagens.",
            }[lang],
            "rubric": [
                {"es": "Identifica el controlador CLARiTY y la pantalla de 5,7\".", "en": "Identifies the CLARiTY controller and 5.7\" display.", "pt": "Identifica o controlador CLARiTY e a tela de 5,7\"."}[lang],
                {"es": "Cita los P/N 403344 (PCB) y 403345 (LCD/táctil).", "en": "Cites P/N 403344 (PCB) and 403345 (LCD/touch).", "pt": "Cita os P/N 403344 (PCB) e 403345 (LCD/touch)."}[lang],
                {"es": "Menciona la ausencia de Ethernet o servidor web.", "en": "Mentions the absence of Ethernet or web server.", "pt": "Menciona a ausência de Ethernet ou servidor web."}[lang],
            ],
        }
    out.append(make_q("X-6210-OPEN", "describe", ["6210"], 3, i18n, source="legacy"))

    # 6420 service open
    i18n = {}
    for lang in LANGS:
        i18n[lang] = {
            "q": {
                "es": "Un cliente reporta pérdida de posición del carro en una DataFlex 6420. Explica el procedimiento: tensión de correa, lubricación, PCB y requisito de firmware.",
                "en": "A customer reports carriage position loss on a DataFlex 6420. Explain the procedure: belt tension, lubrication, PCB and firmware requirement.",
                "pt": "Um cliente relata perda de posição do carro em uma DataFlex 6420. Explique o procedimento: tensão da correia, lubrificação, PCB e requisito de firmware.",
            }[lang],
            "model": {
                "es": "1. Con la impresora apagada, comprobar que el carro se desplace libre; limpiar y lubricar la guía con el kit 402113.\n2. Ajustar la correa a 9 kg ±1 kg (19,8 lb ±2,2 lb) y apretar los tres tornillos del motor.\n3. Revisar la versión de firmware en Tools > Diagnostics > Control > Versions; el 6420/DF+ requiere r10 o superior.\n4. Si persiste, verificar la PCB de la impresora (P/N 402810) y el encoder.\nNo aplicar los 10 kg de la 6330/6530: son plataformas distintas.",
                "en": "1. With the printer off, confirm the carriage moves freely; clean and lubricate the slide with kit 402113.\n2. Set belt tension to 9 kg ±1 kg (19.8 lb ±2.2 lb) and tighten the three motor screws.\n3. Check firmware under Tools > Diagnostics > Control > Versions; the 6420/DF+ requires r10 or later.\n4. If it persists, check the printer PCB (P/N 402810) and the encoder.\nDo not apply the 10 kg used on the 6330/6530: they are different platforms.",
                "pt": "1. Com a impressora desligada, confirmar que o carro se desloca livremente; limpar e lubrificar a guia com o kit 402113.\n2. Ajustar a correia a 9 kg ±1 kg (19,8 lb ±2,2 lb) e apertar os três parafusos do motor.\n3. Verificar o firmware em Tools > Diagnostics > Control > Versions; a 6420/DF+ requer r10 ou superior.\n4. Se persistir, verificar a PCB da impressora (P/N 402810) e o encoder.\nNão aplicar os 10 kg da 6330/6530: são plataformas diferentes.",
            }[lang],
            "rubric": [
                {"es": "Ajusta la correa a 9 kg ±1 kg.", "en": "Sets the belt to 9 kg ±1 kg.", "pt": "Ajusta a correia a 9 kg ±1 kg."}[lang],
                {"es": "Lubrica la guía con 402113 y comprueba el libre recorrido.", "en": "Lubricates the slide with 402113 and checks free travel.", "pt": "Lubrifica a guia com 402113 e verifica o livre curso."}[lang],
                {"es": "Menciona firmware r10+ o PCB 402810.", "en": "Mentions r10+ firmware or PCB 402810.", "pt": "Menciona firmware r10+ ou PCB 402810."}[lang],
            ],
        }
    out.append(make_q("X-6420-OPEN", "errorfix", ["6420"], 3, i18n, source="legacy"))

    # 6320 vs 6420 comparison
    i18n = {}
    for lang in LANGS:
        i18n[lang] = {
            "q": {
                "es": "Compara las DataFlex 6320 y 6420: ancho de cabezal, rendimiento, velocidad continua y capacidad de ribbon. ¿Cuál elegirías para una línea de 400 ppm?",
                "en": "Compare the DataFlex 6320 and 6420: printhead width, throughput, continuous speed and ribbon capacity. Which would you choose for a 400 ppm line?",
                "pt": "Compare as DataFlex 6320 e 6420: largura do cabeçote, rendimento, velocidade contínua e capacidade de ribbon. Qual escolheria para uma linha de 400 ppm?",
            }[lang],
            "model": {
                "es": "6320: cabezales de 32 y 53 mm, 250 ppm, hasta 750 mm/s, ribbon de 1200 m.\n6420: cabezales de 53 y 107 mm, 400 ppm, hasta 1000 mm/s, ribbon de 1200 m (700 m en la versión de 107 mm).\nPara 400 ppm se elige la 6420, porque la 6320 queda en 250 ppm. La 6420 también ofrece mayor ancho (107 mm) y velocidad continua.",
                "en": "6320: 32 and 53 mm printheads, 250 ppm, up to 750 mm/s, 1200 m ribbon.\n6420: 53 and 107 mm printheads, 400 ppm, up to 1000 mm/s, 1200 m ribbon (700 m on the 107 mm version).\nFor 400 ppm choose the 6420, because the 6320 is limited to 250 ppm. The 6420 also offers greater width (107 mm) and continuous speed.",
                "pt": "6320: cabeçotes de 32 e 53 mm, 250 ppm, até 750 mm/s, ribbon de 1200 m.\n6420: cabeçotes de 53 e 107 mm, 400 ppm, até 1000 mm/s, ribbon de 1200 m (700 m na versão de 107 mm).\nPara 400 ppm escolhe-se a 6420, porque a 6320 fica em 250 ppm. A 6420 também oferece maior largura (107 mm) e velocidade contínua.",
            }[lang],
            "rubric": [
                {"es": "Asigna 250 ppm a la 6320 y 400 ppm a la 6420.", "en": "Assigns 250 ppm to the 6320 and 400 ppm to the 6420.", "pt": "Atribui 250 ppm à 6320 e 400 ppm à 6420."}[lang],
                {"es": "Distingue anchos 32/53 mm frente a 53/107 mm.", "en": "Distinguishes 32/53 mm from 53/107 mm widths.", "pt": "Distingue larguras 32/53 mm de 53/107 mm."}[lang],
                {"es": "Recomienda la 6420 para 400 ppm.", "en": "Recommends the 6420 for 400 ppm.", "pt": "Recomenda a 6420 para 400 ppm."}[lang],
            ],
        }
    out.append(make_q("X-DF-OPEN", "describe", ["6320", "6420"], 3, i18n, source="legacy"))

    return out


# ---------------------------------------------------------------------------

def validate(bank):
    if len(bank) < 250:
        raise SystemExit(f"Only {len(bank)} questions")
    ids = set()
    for q in bank:
        if q["id"] in ids:
            raise SystemExit(f"Duplicate id {q['id']}")
        ids.add(q["id"])
        if not q["models"]:
            raise SystemExit(f"No models: {q['id']}")
        for lang in LANGS:
            d = q["i18n"].get(lang)
            if not d or not d.get("q"):
                raise SystemExit(f"Missing {lang}: {q['id']}")
            if q["type"] in ("single", "multi", "errmap"):
                if not d.get("options") or not d.get("answer"):
                    raise SystemExit(f"Bad options: {q['id']} {lang}")
                oids = {o["id"] for o in d["options"]}
                if any(a not in oids for a in d["answer"]):
                    raise SystemExit(f"Answer not in options: {q['id']} {lang}")
            if q["type"] in ("fill", "calc"):
                if not d.get("fields") or not all(f.get("answers") for f in d["fields"]):
                    raise SystemExit(f"Bad fields: {q['id']} {lang}")
            if q["type"] in ("describe", "errorfix"):
                if not d.get("model") or not d.get("rubric"):
                    raise SystemExit(f"Bad open: {q['id']} {lang}")
    return True


def main():
    raw = json.loads((ROOT / "data" / "legacy-raw.json").read_text(encoding="utf-8"))
    bank = [legacy_item(q) for q in raw]

    # Generated specification questions
    seed = 1000
    for model in MODEL_IDS:
        for fact in ("width", "ribbon", "ppm", "speedCont", "speedInt", "dpi", "air", "ethernet", "screen"):
            if fact == "screen" and model not in ("6210", "6230", "6320", "6330", "6420", "6530"):
                continue
            for variant in range(2 if fact not in ("speedInt", "ethernet") else 1):
                seed += 1
                bank.append(spec_single(model, fact, variant, seed))
        for variant in range(2):
            seed += 1
            bank.append(spec_multi(model, variant, seed))
        for variant in range(3):
            bank.append(spec_fill(model, variant, seed + variant))

    bank.extend(build_calcs())
    bank.extend(build_errmap())
    bank.extend(extra_statics())

    validate(bank)

    payload = {
        "version": "2026.10.22",
        "generated": "2026-10-22",
        "models": MODELS,
        "questions": bank,
    }
    out_js = ROOT / "assets" / "js" / "bank.js"
    out_js.parent.mkdir(parents=True, exist_ok=True)
    out_js.write_text("window.TTO_BANK = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    out_json = ROOT / "data" / "bank-preview.json"
    out_json.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    android_assets = ROOT / "android" / "app" / "src" / "main" / "assets"
    android_assets.mkdir(parents=True, exist_ok=True)
    (android_assets / "bank.json").write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    by_type = {}
    by_model = {m: 0 for m in MODEL_IDS}
    for q in bank:
        by_type[q["type"]] = by_type.get(q["type"], 0) + 1
        for m in q["models"]:
            by_model[m] += 1
    print(f"OK: {len(bank)} questions")
    print("Types:", json.dumps(by_type, sort_keys=True))
    print("Models:", json.dumps(by_model, sort_keys=True))
    print("JS KB:", round(out_js.stat().st_size / 1024, 1), "JSON KB:", round((android_assets / 'bank.json').stat().st_size / 1024, 1))


if __name__ == "__main__":
    main()
