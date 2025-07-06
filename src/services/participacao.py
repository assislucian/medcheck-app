def papel_do_procedimento(db, *, guia, codigo, data, crm):
    """
    Busca o papel do médico em uma guia específica, normalizando campos para evitar erros de tipo/formatação.
    Se não encontrar resultado exato, tenta busca parcial (guia+codigo).
    Args:
        db: sessão do banco de dados SQLAlchemy
        guia: número da guia
        codigo: código do procedimento
        data: data do procedimento
        crm: CRM do médico
    Returns:
        Papel do médico (str) ou '--' se não encontrado.
    """
    import logging

    logger = logging.getLogger("participacao")
    try:
        # Importação local para evitar import circular
        from src.api import Guia

        guia = str(guia).strip() if guia else None
        codigo = str(codigo).strip() if codigo else None
        data = str(data).strip() if data else None
        crm = str(crm).strip() if crm else None
        # Busca exata
        papel = (
            db.query(Guia.papel)
            .filter_by(numero_guia=guia, codigo=codigo, data=data, user_id=crm)
            .scalar()
        )
        if papel:
            logger.info(
                f"Match exato: guia={guia}, codigo={codigo}, data={data}, crm={crm} => papel={papel}"
            )
            return papel
        # Busca parcial (guia+codigo)
        matches = db.query(Guia).filter_by(numero_guia=guia, codigo=codigo).all()
        if matches:
            logger.info(
                f"Match parcial: guia={guia}, codigo={codigo}, encontrados={len(matches)}"
            )
            for m in matches:
                logger.info(f"Parcial: {m}")
            return matches[0].papel if matches[0].papel else "--"
        logger.warning(
            f"Nenhum match: guia={guia}, codigo={codigo}, data={data}, crm={crm}"
        )
        return "--"
    except Exception as e:
        logger.error(f"Erro ao buscar papel: {e}")
        return "--"
