#!/usr/bin/env python3
"""Gera scripts/data/seed-data.json a partir da planilha Convênios_apartir2021.xlsx.

Rode a partir da raiz do repositório:
    python3 packages/db/scripts/build-seed-data.py
"""
import json
import re
import datetime
from pathlib import Path

import openpyxl
from openpyxl.utils import column_index_from_string as ci

ROOT = Path(__file__).resolve().parents[3]
XLSX = ROOT / "Convênios_apartir2021.xlsx"
OUT = Path(__file__).resolve().parent / "data" / "seed-data.json"

DATA_FIRST_ROW = 2
DATA_LAST_ROW = 40  # linhas 2..40 = 39 convênios

# --- Secretarias da Prefeitura de Votorantim (gestão 2026) -------------------
SECRETARIAS = [
    ("SEA", "Secretaria de Administração", "Claudio Toledo de Camargo (Caio)"),
    ("SECI", "Secretaria de Cidadania e Geração de Renda", "Leda Diniz"),
    ("SEC", "Secretaria de Cultura e Turismo", "Evandro Gonçalves Domingues"),
    ("SEED", "Secretaria de Educação", "Tiago Antonio de Araújo"),
    ("SEDESP", "Secretaria de Esportes", "Sheila Corrêa"),
    ("SEF", "Secretaria de Finanças", "Rafael Bassi"),
    ("SEG", "Secretaria de Governo", "Roberto Bellini Martins"),
    ("SEMA", "Secretaria de Meio Ambiente", "Luiz Carlos Corrêa"),
    ("DTT", "Secretaria de Mobilidade Urbana", "Jonata Elias Mena"),
    ("SENJ", "Secretaria de Negócios Jurídicos", "Jonata Elias Mena (interino)"),
    ("SOURB", "Secretaria de Obras e Urbanismo", "Carlos José de Almeida (Carlota)"),
    ("SPD", "Secretaria de Planejamento e Desenvolvimento", "Carlos José de Almeida (interino)"),
    ("SESA", "Secretaria da Saúde", "Alan Francisco Almeida (interino)"),
    ("SESP", "Secretaria de Serviços Públicos", "Luiz Antonio Cares"),
]

# Mapeia o valor da coluna "Área" da planilha -> sigla da secretaria
AREA_TO_SECRETARIA = {
    "INFRAESTRUTURA": "SOURB",
    "INFRAESTRUTURA PRODUTIVA": "SOURB",
    "PRODUÇÃO AGRÍCOLA": "SOURB",
    "CULTURA": "SEC",
    "TURISMO": "SEC",
    "MEIO AMBIENTE": "SEMA",
    "RESÍDUOS SÓLIDOS": "SEMA",
    "ESPORTE": "SEDESP",
    "EDUCAÇÃO": "SEED",
    "SAÚDE": "SESA",
    "SEGURANÇA": "SEG",
    "MES E EPPS": "SECI",
}

# Convênios sem "Área" preenchida -> secretaria inferida pelo objeto (linha da planilha)
ROW_SECRETARIA_OVERRIDE = {
    33: "SEED",   # Plataformas Digitais - Alfabetização
    34: "SEDESP", # Construção de campo de futebol society
    35: "SEG",    # Aquisição de viatura (segurança)
    38: "SEG",    # Doação - aquisição segurança (MJSP)
    39: "SOURB",  # Revitalização de espaços públicos
    40: "SOURB",  # Qualificação de vias urbanas
}

MODALIDADE_LICITACAO = {
    "concorrência pública": "CONCORRENCIA",
    "concorrência eletrônica": "CONCORRENCIA",
    "tomada de preços": "TOMADA_PRECOS",
    "pregão": "PREGAO",
    "dispensa": "DISPENSA",
    "inexigibilidade": "INEXIGIBILIDADE",
}


def col(letter):
    return ci(letter)


def slug(text):
    text = text.lower().strip()
    text = (text.replace("á", "a").replace("ã", "a").replace("â", "a")
                .replace("é", "e").replace("ê", "e").replace("í", "i")
                .replace("ó", "o").replace("ô", "o").replace("õ", "o")
                .replace("ú", "u").replace("ç", "c"))
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text[:60]


def as_text(value):
    if value is None:
        return None
    if isinstance(value, datetime.datetime):
        return value.date().isoformat()
    s = str(value).strip()
    return s or None


def as_iso(value):
    if isinstance(value, datetime.datetime):
        return value.date().isoformat()
    return None


def as_number(value):
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return float(value)
    return None


def as_int(value):
    if isinstance(value, int) and not isinstance(value, bool):
        return value
    if isinstance(value, float) and value.is_integer():
        return int(value)
    return None


def truncate(text, limit=190):
    if text is None:
        return None
    text = " ".join(str(text).split())
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def split_itens(text):
    """Divide textos numerados ('1. ... 2. ...') em itens separados."""
    if not text:
        return []
    raw = str(text).strip()
    parts = re.split(r"(?:^|\n|\s)\d+[\.\)]\s+", raw)
    parts = [" ".join(p.split()) for p in parts if p and p.strip()]
    if len(parts) > 1:
        return parts
    return [" ".join(raw.split())]


def main():
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    ws = wb["Em andamento"]

    def cell(row, letter):
        return ws.cell(row=row, column=col(letter)).value

    convenios = []
    orgaos = {}      # nome -> esfera
    programas = {}   # texto completo -> True
    modalidades = set()
    tipos_termo = set()

    seq = 0
    for row in range(DATA_FIRST_ROW, DATA_LAST_ROW + 1):
        objeto = as_text(cell(row, "V"))
        codigo_proposta = as_text(cell(row, "C"))
        if not objeto and not codigo_proposta:
            continue
        seq += 1
        codigo = f"CONV-{seq:03d}"

        situacao = as_text(cell(row, "K")) or ""
        esfera_raw = (as_text(cell(row, "J")) or "").lower()
        esfera = "FEDERAL" if esfera_raw.startswith("federal") else (
            "ESTADUAL" if esfera_raw.startswith("estadual") else None)

        modalidade = as_text(cell(row, "B"))
        if modalidade:
            modalidades.add(modalidade)
        tipo_termo = as_text(cell(row, "D"))
        if tipo_termo:
            tipos_termo.add(tipo_termo)

        ministerio = as_text(cell(row, "T"))
        if ministerio:
            orgaos.setdefault(ministerio, esfera)
            if esfera and not orgaos[ministerio]:
                orgaos[ministerio] = esfera

        programa_texto = as_text(cell(row, "U"))
        if programa_texto:
            programas[programa_texto] = True

        # contrato ----------------------------------------------------------
        num_contrato = as_text(cell(row, "AB"))
        contratada = as_text(cell(row, "AC"))
        tem_contrato = bool(num_contrato or contratada)
        contrato = None
        if tem_contrato:
            z = (as_text(cell(row, "Z")) or "").lower()
            modalidade_lic = None
            for key, enum in MODALIDADE_LICITACAO.items():
                if z.startswith(key):
                    modalidade_lic = enum
                    break
            contrato = {
                "modalidadeLicitacao": modalidade_lic,
                "numProcessoLicitatorio": truncate(cell(row, "BF")),
                "numeroContrato": num_contrato,
                "contratadaNome": contratada,
                "dataAssinatura": as_iso(cell(row, "AE")),
                "dataVigenciaFim": as_iso(cell(row, "AF")),
                "dataOIS": as_iso(cell(row, "AI")),
                "dataTerminoExecucao": as_iso(cell(row, "AJ")),
                "valorContrato": as_number(cell(row, "AL")),
                "cno": truncate(cell(row, "AW")),
                "engenheiroResponsavel": truncate(cell(row, "BM")),
            }

        # status ------------------------------------------------------------
        if situacao == "Assinado":
            status = "EM_EXECUCAO" if tem_contrato else "APROVADO"
        elif situacao == "Cláusula Suspensiva":
            status = "EM_ANALISE"
        else:  # Proposta, Indicação
            status = "RASCUNHO"

        # secretaria --------------------------------------------------------
        area = as_text(cell(row, "BO"))
        sigla = None
        if area:
            sigla = AREA_TO_SECRETARIA.get(area.upper())
        if not sigla:
            sigla = ROW_SECRETARIA_OVERRIDE.get(row, "SPD")

        # emenda parlamentar ------------------------------------------------
        parlamentar = as_text(cell(row, "L"))
        emenda = None
        if parlamentar:
            emenda = {
                "nomeParlamentar": truncate(parlamentar),
                "partido": as_text(cell(row, "M")),
                "codigoEmenda": as_text(cell(row, "N")),
                "funcao": as_text(cell(row, "O")),
                "subfuncao": as_text(cell(row, "P")),
                "programa": truncate(programa_texto),
                "valorIndicado": as_number(cell(row, "R")),
                "anoEmenda": as_int(cell(row, "G")),
            }

        # financeiro --------------------------------------------------------
        conta = truncate(cell(row, "W"))
        valor_liberado = as_number(cell(row, "X"))
        data_deposito = as_iso(cell(row, "Y"))
        saldo_rend = as_number(cell(row, "BB"))
        codigo_receita = as_text(cell(row, "Q"))
        financeiro = None
        if conta or valor_liberado or data_deposito or saldo_rend or codigo_receita:
            financeiro = {
                "contaBancaria": conta,
                "valorLiberadoTotal": valor_liberado,
                "dataDeposito": data_deposito,
                "saldoRendimentos": saldo_rend,
                "codigoReceita": codigo_receita,
            }

        # pendências --------------------------------------------------------
        pend_itens = split_itens(cell(row, "BK"))
        orgao_itens = split_itens(cell(row, "BL"))
        pendencias = []
        for idx, descricao in enumerate(pend_itens):
            if not descricao:
                continue
            if len(orgao_itens) == len(pend_itens):
                orgao_resp = orgao_itens[idx]
            else:
                orgao_resp = truncate(cell(row, "BL"))
            pendencias.append({
                "descricao": truncate(descricao),
                "orgaoResponsavel": truncate(orgao_resp),
                "status": "ABERTA",
            })

        # aditivos ----------------------------------------------------------
        aditivos = []
        ag = as_iso(cell(row, "AG"))
        if ag:
            aditivos.append({"tipoAditivo": "PRAZO", "novaVigencia": ag,
                             "motivo": "Aditamento de vigência"})
        ak = as_iso(cell(row, "AK"))
        if ak:
            aditivos.append({"tipoAditivo": "PRAZO", "novaVigencia": ak,
                             "motivo": "Aditamento de prazo de execução"})
        av = as_number(cell(row, "AV"))
        if av:
            aditivos.append({"tipoAditivo": "VALOR", "valorAcrescimo": av,
                             "motivo": "Aditamento de valor"})
        for i, ad in enumerate(aditivos):
            ad["numeroAditivo"] = i + 1

        repasse = as_number(cell(row, "R")) or 0.0
        contrapartida = as_number(cell(row, "S")) or 0.0

        clausula = cell(row, "I") is not None or situacao == "Cláusula Suspensiva"

        convenios.append({
            "codigo": codigo,
            "titulo": truncate(objeto or codigo_proposta or codigo),
            "objeto": objeto or codigo_proposta or codigo,
            "descricao": as_text(cell(row, "BN")),
            "status": status,
            "esfera": esfera,
            "clausulaSuspensiva": clausula,
            "numeroProposta": truncate(codigo_proposta),
            "numeroTermo": truncate(as_text(cell(row, "E"))),
            "ministerioOrgao": ministerio,
            "area": area,
            "dataInicioProcesso": as_iso(cell(row, "A")),
            "dataAssinatura": as_iso(cell(row, "F")),
            "dataInicioVigencia": as_iso(cell(row, "F")),
            "dataFimVigencia": as_iso(cell(row, "H")),
            "processoSPD": as_text(cell(row, "BD")),
            "processoCreditoAdicional": as_text(cell(row, "BE")),
            "valorGlobal": round(repasse + contrapartida, 2),
            "valorRepasse": as_number(cell(row, "R")),
            "valorContrapartida": as_number(cell(row, "S")),
            "secretariaSigla": sigla,
            "orgaoNome": ministerio,
            "programaNome": programa_texto,
            "modalidadeNome": modalidade,
            "tipoTermoNome": tipo_termo,
            "emenda": emenda,
            "financeiro": financeiro,
            "contrato": contrato,
            "pendencias": pendencias,
            "aditivos": aditivos,
        })

    # catálogos ------------------------------------------------------------
    secretarias = [
        {"id": f"sec-{slug(s)}", "sigla": s, "nome": n, "responsavel": r}
        for s, n, r in SECRETARIAS
    ]
    orgaos_out = [
        {"id": f"org-{slug(nome)}", "nome": nome, "esfera": esfera}
        for nome, esfera in sorted(orgaos.items())
    ]
    programas_out = []
    for i, texto in enumerate(sorted(programas), start=1):
        programas_out.append({
            "id": f"prog-{i:03d}",
            "nome": truncate(texto),
            "descricao": truncate(texto),
        })
    modalidades_out = [
        {"id": f"mod-{slug(m)}", "nome": m} for m in sorted(modalidades)
    ]
    # tipos de termo: valores da planilha + os 4 antigos migrados
    tipos = set(tipos_termo)
    tipos.update(["Termo de Colaboração", "Termo de Fomento"])
    tipos_out = [
        {"id": f"tipo-{slug(t)}", "nome": t} for t in sorted(tipos)
    ]

    # resolve referências (nome -> id) em cada convênio --------------------
    sec_by_sigla = {s["sigla"]: s["id"] for s in secretarias}
    org_by_nome = {o["nome"]: o["id"] for o in orgaos_out}
    prog_by_nome = {texto: f"prog-{i:03d}"
                    for i, texto in enumerate(sorted(programas), start=1)}
    mod_by_nome = {m["nome"]: m["id"] for m in modalidades_out}
    tipo_by_nome = {t["nome"]: t["id"] for t in tipos_out}

    for c in convenios:
        c["secretariaId"] = sec_by_sigla[c["secretariaSigla"]]
        c["orgaoId"] = org_by_nome.get(c["orgaoNome"])
        c["programaId"] = prog_by_nome.get(c["programaNome"])
        c["modalidadeRepasseId"] = mod_by_nome.get(c["modalidadeNome"])
        c["tipoTermoFormalizacaoId"] = tipo_by_nome.get(c["tipoTermoNome"])

    payload = {
        "geradoEm": datetime.datetime.now().isoformat(timespec="seconds"),
        "secretarias": secretarias,
        "orgaos": orgaos_out,
        "programas": programas_out,
        "modalidadesRepasse": modalidades_out,
        "tiposTermoFormalizacao": tipos_out,
        "convenios": convenios,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK -> {OUT}")
    print(f"  secretarias={len(secretarias)} orgaos={len(orgaos_out)} "
          f"programas={len(programas_out)} modalidades={len(modalidades_out)} "
          f"tiposTermo={len(tipos_out)} convenios={len(convenios)}")


if __name__ == "__main__":
    main()
