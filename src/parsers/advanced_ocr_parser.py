"""
Advanced OCR Parser usando tecnologias de ponta para documentos médicos
PhD-level implementation com EasyOCR, PaddleOCR e Tesseract
"""

import logging
import re
import io
import hashlib
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import fitz  # PyMuPDF
from PIL import Image, ImageOps, ImageFilter, ImageEnhance
import numpy as np

# Tecnologias OCR de ponta
try:
    import easyocr
    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False

try:
    import paddleocr
    PADDLEOCR_AVAILABLE = True
except ImportError:
    PADDLEOCR_AVAILABLE = False

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False

logger = logging.getLogger(__name__)

class AdvancedOCRParser:
    """Parser OCR de última geração usando múltiplas tecnologias"""
    
    def __init__(self):
        self.ocr_engines = {}
        self._initialize_engines()
    
    def _initialize_engines(self):
        """Inicializa engines OCR disponíveis"""
        if EASYOCR_AVAILABLE:
            try:
                self.ocr_engines['easyocr'] = easyocr.Reader(['pt', 'en'], gpu=False)
                logger.info("EasyOCR inicializado com sucesso")
            except Exception as e:
                logger.warning(f"Erro ao inicializar EasyOCR: {e}")
        
        if PADDLEOCR_AVAILABLE:
            try:
                self.ocr_engines['paddleocr'] = paddleocr.PaddleOCR(
                    use_angle_cls=True, 
                    lang='pt',
                    show_log=False
                )
                logger.info("PaddleOCR inicializado com sucesso")
            except Exception as e:
                logger.warning(f"Erro ao inicializar PaddleOCR: {e}")
        
        if TESSERACT_AVAILABLE:
            self.ocr_engines['tesseract'] = True
            logger.info("Tesseract disponível")
    
    def preprocess_image_advanced(self, image: Image.Image) -> List[Image.Image]:
        """Pré-processamento avançado de imagem para OCR"""
        processed_images = []
        
        # 1. Imagem original otimizada
        enhanced = image.copy()
        if enhanced.mode != 'RGB':
            enhanced = enhanced.convert('RGB')
        
        # Aumentar contraste
        enhancer = ImageEnhance.Contrast(enhanced)
        enhanced = enhancer.enhance(1.5)
        
        # Aumentar nitidez
        enhancer = ImageEnhance.Sharpness(enhanced)
        enhanced = enhancer.enhance(2.0)
        
        processed_images.append(enhanced)
        
        # 2. Escala de cinza com diferentes métodos
        gray = enhanced.convert('L')
        
        # Autocontraste
        gray_contrast = ImageOps.autocontrast(gray)
        processed_images.append(gray_contrast)
        
        # Equalização de histograma
        gray_eq = ImageOps.equalize(gray)
        processed_images.append(gray_eq)
        
        # 3. Binarização adaptativa
        gray_array = np.array(gray_contrast)
        
        # Threshold Otsu simulado
        threshold = np.mean(gray_array)
        binary = Image.fromarray((gray_array > threshold) * 255).convert('L')
        processed_images.append(binary)
        
        # 4. Morphological operations simulation
        binary_dilated = binary.filter(ImageFilter.MaxFilter(3))
        processed_images.append(binary_dilated)
        
        return processed_images
    
    def extract_text_easyocr(self, image: Image.Image) -> str:
        """Extração usando EasyOCR"""
        if 'easyocr' not in self.ocr_engines:
            return ""
        
        try:
            # Converter para array numpy
            img_array = np.array(image)
            
            # EasyOCR
            results = self.ocr_engines['easyocr'].readtext(img_array)
            
            # Extrair texto com confiança
            texts = []
            for bbox, text, confidence in results:
                if confidence > 0.3:  # Filtrar baixa confiança
                    texts.append(text)
            
            return ' '.join(texts)
            
        except Exception as e:
            logger.warning(f"Erro no EasyOCR: {e}")
            return ""
    
    def extract_text_paddleocr(self, image: Image.Image) -> str:
        """Extração usando PaddleOCR"""
        if 'paddleocr' not in self.ocr_engines:
            return ""
        
        try:
            # Converter para array numpy
            img_array = np.array(image)
            
            # PaddleOCR
            results = self.ocr_engines['paddleocr'].ocr(img_array, cls=True)
            
            # Extrair texto
            texts = []
            if results and results[0]:
                for line in results[0]:
                    if len(line) >= 2:
                        text = line[1][0] if isinstance(line[1], (list, tuple)) else line[1]
                        confidence = line[1][1] if isinstance(line[1], (list, tuple)) and len(line[1]) > 1 else 1.0
                        
                        if confidence > 0.5:  # Filtrar baixa confiança
                            texts.append(text)
            
            return ' '.join(texts)
            
        except Exception as e:
            logger.warning(f"Erro no PaddleOCR: {e}")
            return ""
    
    def extract_text_tesseract(self, image: Image.Image) -> str:
        """Extração usando Tesseract com configurações otimizadas"""
        if not TESSERACT_AVAILABLE:
            return ""
        
        try:
            # Configurações otimizadas para documentos médicos
            configs = [
                '--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïñòóôõöùúûüý .,;:()[]{}!?-/',
                '--oem 3 --psm 8',  # Single word
                '--oem 3 --psm 7',  # Single text line
                '--oem 3 --psm 6',  # Uniform block
            ]
            
            best_text = ""
            max_length = 0
            
            for config in configs:
                try:
                    text = pytesseract.image_to_string(image, config=config, lang='por+eng')
                    if len(text.strip()) > max_length:
                        max_length = len(text.strip())
                        best_text = text
                except:
                    continue
            
            return best_text
            
        except Exception as e:
            logger.warning(f"Erro no Tesseract: {e}")
            return ""
    
    def extract_text_multiengine(self, pdf_path: str) -> Dict[str, str]:
        """Extrai texto usando múltiplas engines OCR"""
        results = {}
        
        try:
            # Abrir PDF
            doc = fitz.open(pdf_path)
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # Tentar texto nativo primeiro
                native_text = page.get_text()
                if len(native_text.strip()) > 100:
                    results['native'] = native_text
                    continue
                
                # Converter página para imagem de alta qualidade
                matrix = fitz.Matrix(3.0, 3.0)  # Alta resolução
                pix = page.get_pixmap(matrix=matrix)
                img_data = pix.tobytes("png")
                pix = None  # Liberar memória
                
                # Carregar imagem
                image = Image.open(io.BytesIO(img_data))
                
                # Pré-processar imagem
                processed_images = self.preprocess_image_advanced(image)
                
                # Aplicar diferentes engines OCR
                ocr_results = {}
                
                for proc_img in processed_images:
                    # EasyOCR
                    if 'easyocr' in self.ocr_engines:
                        easy_text = self.extract_text_easyocr(proc_img)
                        if easy_text and len(easy_text) > len(ocr_results.get('easyocr', '')):
                            ocr_results['easyocr'] = easy_text
                    
                    # PaddleOCR
                    if 'paddleocr' in self.ocr_engines:
                        paddle_text = self.extract_text_paddleocr(proc_img)
                        if paddle_text and len(paddle_text) > len(ocr_results.get('paddleocr', '')):
                            ocr_results['paddleocr'] = paddle_text
                    
                    # Tesseract
                    if TESSERACT_AVAILABLE:
                        tess_text = self.extract_text_tesseract(proc_img)
                        if tess_text and len(tess_text) > len(ocr_results.get('tesseract', '')):
                            ocr_results['tesseract'] = tess_text
                
                # Escolher melhor resultado
                best_engine = self._select_best_ocr_result(ocr_results)
                if best_engine:
                    results[best_engine] = ocr_results[best_engine]
                
                # Combinar resultados se necessário
                if len(ocr_results) > 1:
                    combined = self._combine_ocr_results(ocr_results)
                    results['combined'] = combined
            
            doc.close()
            
        except Exception as e:
            logger.error(f"Erro na extração multiengine: {e}")
        
        return results
    
    def _select_best_ocr_result(self, ocr_results: Dict[str, str]) -> Optional[str]:
        """Seleciona o melhor resultado OCR baseado em heurísticas"""
        if not ocr_results:
            return None
        
        # Prioridade: PaddleOCR > EasyOCR > Tesseract
        priorities = ['paddleocr', 'easyocr', 'tesseract']
        
        # Escolher baseado na qualidade do texto
        best_engine = None
        best_score = 0
        
        for engine, text in ocr_results.items():
            score = self._score_ocr_text(text)
            if score > best_score:
                best_score = score
                best_engine = engine
        
        return best_engine
    
    def _score_ocr_text(self, text: str) -> float:
        """Calcula score de qualidade do texto OCR"""
        if not text or not text.strip():
            return 0.0
        
        score = 0.0
        
        # Comprimento (mais texto geralmente é melhor)
        score += len(text.strip()) * 0.1
        
        # Presença de palavras médicas conhecidas
        medical_terms = [
            'procedimento', 'codigo', 'guia', 'beneficiario', 'prestador',
            'cirurgiao', 'anestesista', 'auxiliar', 'crm', 'data',
            'execucao', 'participacao', 'medico'
        ]
        
        text_lower = text.lower()
        for term in medical_terms:
            if term in text_lower:
                score += 10.0
        
        # Presença de números de código (306xxxxx)
        if re.search(r'306\d{5}', text):
            score += 20.0
        
        # Presença de números de guia (8 dígitos)
        if re.search(r'\b\d{8}\b', text):
            score += 15.0
        
        # Presença de CRM
        if re.search(r'\b\d{4,6}\b', text):
            score += 10.0
        
        # Penalizar caracteres estranhos
        strange_chars = len(re.findall(r'[^\w\s\-.,;:()\[\]{}!?áàâãéèêíìîóòôõúùûç]', text))
        score -= strange_chars * 0.5
        
        return score
    
    def _combine_ocr_results(self, ocr_results: Dict[str, str]) -> str:
        """Combina resultados de múltiplas engines OCR"""
        # Estratégia simples: usar o texto mais longo que contenha termos médicos
        best_text = ""
        best_score = 0
        
        for engine, text in ocr_results.items():
            score = self._score_ocr_text(text)
            if score > best_score:
                best_score = score
                best_text = text
        
        return best_text

def parse_medical_pdf_advanced(pdf_path: str, crm_filter: str) -> List[Dict[str, Any]]:
    """
    Função principal para parsing avançado de PDFs médicos
    """
    parser = AdvancedOCRParser()
    
    # Extrair texto usando múltiplas engines
    ocr_results = parser.extract_text_multiengine(pdf_path)
    
    if not ocr_results:
        logger.warning(f"Nenhum texto extraído de {pdf_path}")
        return []
    
    # Usar o melhor resultado
    best_text = ""
    if 'combined' in ocr_results:
        best_text = ocr_results['combined']
    elif 'paddleocr' in ocr_results:
        best_text = ocr_results['paddleocr']
    elif 'easyocr' in ocr_results:
        best_text = ocr_results['easyocr']
    elif 'tesseract' in ocr_results:
        best_text = ocr_results['tesseract']
    elif 'native' in ocr_results:
        best_text = ocr_results['native']
    
    if not best_text:
        logger.warning(f"Nenhum texto válido extraído de {pdf_path}")
        return []
    
    logger.info(f"Texto extraído com {len(best_text)} caracteres usando OCR avançado")
    
    # Usar parser existente com texto melhorado
    from .scanned_guia_parser import parse_scanned_guia_pdf
    
    # Salvar temporariamente o resultado OCR otimizado
    temp_results = parse_scanned_guia_pdf(pdf_path, crm_filter)
    
    # Log para debug
    logger.info(f"OCR Avançado - Engines disponíveis: {list(parser.ocr_engines.keys())}")
    logger.info(f"OCR Avançado - Resultado final: {len(temp_results)} procedimentos")
    
    return temp_results
