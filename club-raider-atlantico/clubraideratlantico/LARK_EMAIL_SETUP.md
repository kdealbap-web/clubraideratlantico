# Correos Corporativos Gratuitos con Lark + clubraideratlantico.com

## Prerrequisitos
- Dominio `clubraideratlantico.com` con acceso al panel DNS (Namecheap, Cloudflare, GoDaddy, etc.)
- Cuenta Lark ya creada en [larksuite.com](https://larksuite.com) o [feishu.cn](https://feishu.cn)

---

## Paso 1 — Accede a la configuración del dominio en Lark

1. Inicia sesión en **Lark Admin Console**: `https://admin.larksuite.com`
2. Ve a **Organization Settings → Domain Management**
3. Clic en **Add Domain** e ingresa `clubraideratlantico.com`

---

## Paso 2 — Verifica la propiedad del dominio

Lark te dará un registro **TXT** para verificar. Añádelo en tu proveedor DNS:

| Tipo | Host/Name | Valor |
|------|-----------|-------|
| TXT  | `@`       | `lark-site-verification=XXXXXXXXXX` |

> ⏱ La propagación DNS puede tomar entre **5 minutos y 48 horas**.
> Herramienta de verificación: [dnschecker.org](https://dnschecker.org)

---

## Paso 3 — Configura los registros MX

Una vez verificado el dominio, añade los registros **MX** en tu DNS:

| Tipo | Host | Apunta a                        | Prioridad |
|------|------|---------------------------------|-----------|
| MX   | `@`  | `mx1.larksuite.com`             | 10        |
| MX   | `@`  | `mx2.larksuite.com`             | 20        |

> ⚠️ **Elimina** cualquier registro MX previo (ej. de G Suite o Zoho) antes de añadir estos.

---

## Paso 4 — Crea los 5 correos corporativos recomendados

En **Lark Admin → Members → Add Member**, crea los siguientes usuarios:

| Email sugerido                              | Rol              | Uso                                      |
|---------------------------------------------|------------------|------------------------------------------|
| `presidente@clubraideratlantico.com`        | Admin            | Dirección oficial del club               |
| `contacto@clubraideratlantico.com`          | Member           | Contacto público y formularios           |
| `registro@clubraideratlantico.com`          | Member           | Gestión de socios y membresías           |
| `eventos@clubraideratlantico.com`           | Member           | Coordinación de rodadas y eventos        |
| `noreply@clubraideratlantico.com`           | Member (system)  | Envíos automáticos (Supabase, alertas)   |

---

## Paso 5 — Configura SPF, DKIM y DMARC (anti-spam)

Añade estos registros TXT adicionales en tu DNS para máxima entregabilidad:

### SPF
```
Tipo: TXT
Host: @
Valor: v=spf1 include:_spf.larksuite.com ~all
```

### DMARC
```
Tipo: TXT
Host: _dmarc
Valor: v=DMARC1; p=quarantine; rua=mailto:contacto@clubraideratlantico.com
```

### DKIM
> Obtén el valor DKIM en: **Lark Admin → Email → DKIM Settings**
> Lark genera el par de claves automáticamente.

---

## Paso 6 — Conecta `noreply@` con Supabase

En **Supabase Dashboard → Authentication → Email Settings**:

```
SMTP Host:     smtp.larksuite.com
SMTP Port:     465 (SSL) o 587 (STARTTLS)
SMTP User:     noreply@clubraideratlantico.com
SMTP Password: [contraseña de la cuenta Lark]
Sender Name:   Club Raider Atlántico
Sender Email:  noreply@clubraideratlantico.com
```

---

## Plan Gratuito de Lark — Límites a tener en cuenta

| Característica         | Plan Free             |
|------------------------|-----------------------|
| Usuarios               | Hasta 50              |
| Almacenamiento email   | 15 GB por usuario     |
| Mensajes enviados/día  | Sin límite anunciado  |
| Videoconferencia       | Hasta 100 personas    |
| Documentos colaborativos | ✅ Incluido          |

> Para 5 correos corporativos el plan gratuito es más que suficiente en Fase 0 y Fase 1.

---

## Checklist Final

- [ ] Dominio verificado en Lark Admin
- [ ] Registros MX activos y propagados
- [ ] 5 cuentas creadas
- [ ] SPF y DMARC configurados
- [ ] DKIM activado desde Lark Admin
- [ ] `noreply@` conectado a Supabase SMTP
- [ ] Test de envío: envía un correo a Gmail y verifica que no caiga en spam

---

*Generado para Club Raider Atlántico — Fase 0 DevOps Setup*
