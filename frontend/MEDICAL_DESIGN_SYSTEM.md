# 🏥 MedCheck Medical Design System

## Visão Geral

A nova paleta de cores médica foi desenvolvida para transmitir confiança, limpeza e profissionalismo - valores essenciais para uma aplicação médica. Substituímos os tons quentes âmbar/laranja por uma paleta fria e limpa de azuis, cianos e teals.

## 🎨 Paleta de Cores

### Brand Colors (Azul Médico Principal)

```css
brand: {
  50: '#F0F9FF',   // Very light blue-white
  100: '#E0F2FE',  // Light blue wash
  200: '#BAE6FD',  // Soft blue
  300: '#7DD3FC',  // Light cyan-blue
  400: '#38BDF8',  // Bright cyan
  500: '#0EA5E9',  // Primary medical blue
  600: '#0284C7',  // Deep blue
  700: '#0369A1',  // Dark blue
  800: '#075985',  // Very dark blue
  900: '#0C4A6E',  // Navy blue
}
```

### Medical Colors (Azul Médico Especializado)

```css
medical: {
  50: '#F5FCFF',   // Crisp white with hint of blue
  100: '#E9F7FE',  // Very light medical blue
  200: '#D6EEFD',  // Light wash
  300: '#B0DCFA',  // Soft blue for accents
  400: '#7FC5F7',  // Medium blue for highlights
  500: '#3B9DF8',  // Primary medical blue
  600: '#0F7BC4',  // Trust blue
  700: '#075F9A',  // Deep trust blue
  800: '#064770',  // Dark professional blue
  900: '#053247',  // Deep navy
}
```

### Mint Colors (Teal Médico - Frescor e Limpeza)

```css
mint: {
  50: '#F0FDFA',   // Very light mint
  100: '#CCFBF1',  // Light mint wash
  200: '#99F6E4',  // Soft mint
  300: '#5EEAD4',  // Fresh mint
  400: '#2DD4BF',  // Bright teal
  500: '#14B8A6',  // Primary teal
  600: '#0D9488',  // Deep teal
  700: '#0F766E',  // Dark teal
  800: '#115E59',  // Very dark teal
  900: '#134E4A',  // Deep teal-green
}
```

### Trust Colors (Azul Confiança)

```css
trust: {
  50: '#EFF6FF',   // Trust blue wash
  100: '#DBEAFE',  // Light trust blue
  200: '#BFDBFE',  // Soft trust blue
  300: '#93C5FD',  // Medium trust blue
  400: '#60A5FA',  // Bright trust blue
  500: '#3B82F6',  // Primary trust blue
  600: '#2563EB',  // Deep trust blue
  700: '#1D4ED8',  // Dark trust blue
  800: '#1E40AF',  // Very dark trust blue
  900: '#1E3A8A',  // Navy trust blue
}
```

### Clinical Colors (Cinza Clínico)

```css
clinical: {
  50: '#FAFAFA',   // Clinical white
  100: '#F4F4F5',  // Light gray
  200: '#E4E4E7',  // Soft gray
  300: '#D4D4D8',  // Medium gray
  400: '#A1A1AA',  // Gray for text
  500: '#71717A',  // Dark gray
  600: '#52525B',  // Darker gray
  700: '#3F3F46',  // Very dark gray
  800: '#27272A',  // Near black
  900: '#18181B',  // Deep black
}
```

## 🎯 Aplicação da Paleta

### Gradientes de Fundo

- **Páginas principais**: `from-medical-50/40 via-brand-50/20 to-mint-50/30`
- **Cards hover**: `from-medical-100 via-brand-100 to-trust-200`
- **Elementos de destaque**: `from-medical-500 to-brand-600`

### Elementos Interativos

- **Botões primários**: `medical-600` → `medical-700`
- **Links**: `medical-600` → `medical-800`
- **Badges importantes**: `medical-100` background com `medical-700` text

### Estados de Status

- **Sucesso**: `mint-500` (Teal para aprovado/pago)
- **Atenção**: `medical-500` (Azul médico para pendente)
- **Erro**: `red-500` (Mantido para crítico)

## 🔄 Migração Realizada

### Antes (Tons Quentes)

- `amber-50/40 via-orange-50/20 to-rose-50/30`
- `from-amber-600 via-orange-600 to-yellow-600`
- `amber-700`, `orange-600`, `yellow-600`

### Depois (Tons Médicos)

- `medical-50/40 via-brand-50/20 to-mint-50/30`
- `from-medical-600 via-brand-600 to-trust-600`
- `medical-700`, `brand-600`, `trust-800`

## 📱 Compatibilidade

- ✅ **WCAG AA**: Todos os contrastes respeitam acessibilidade
- ✅ **Dark Mode**: Todas as cores têm variantes dark
- ✅ **Mobile**: Gradientes otimizados para performance
- ✅ **Print**: Cores mantêm legibilidade em impressão

## 🎨 Design Principles

1. **Confiança**: Azuis transmitem segurança e profissionalismo
2. **Limpeza**: Tons claros evocam higiene e precisão médica
3. **Calma**: Paleta fria reduz ansiedade do usuário
4. **Foco**: Contraste sutil mantém atenção no conteúdo
5. **Medicina**: Cores tradicionalmente associadas à área médica

## 🔧 Usage Examples

```tsx
// Background gradients
<div className="bg-gradient-to-br from-medical-50/40 via-brand-50/20 to-mint-50/30">

// Interactive elements
<button className="bg-medical-600 hover:bg-medical-700 text-white">

// Status indicators
<Badge className="bg-medical-100 text-medical-700 border-medical-200">

// Text gradients
<h1 className="bg-gradient-to-r from-medical-700 via-brand-600 to-trust-800 bg-clip-text text-transparent">
```

Esta nova paleta posiciona o MedCheck como uma plataforma médica confiável, limpa e profissional, alinhada com as expectativas visuais da área de saúde.
