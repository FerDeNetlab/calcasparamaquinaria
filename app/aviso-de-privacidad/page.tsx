'use client'

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"

export default function AvisoDePrivacidad() {
    return (
        <main>
            <Navbar />
            <div className="min-h-screen bg-background">
                <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Aviso de Privacidad</h1>
                    <p className="text-sm text-muted-foreground mb-10">Última actualización: 21 de febrero de 2026</p>

                    <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_strong]:text-foreground [&_a]:text-primary [&_a]:underline">

                        <p>
                            En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), su Reglamento y los Lineamientos del Aviso de Privacidad, <strong>Publim S.A. de C.V.</strong> (en adelante &ldquo;Publim&rdquo;), con domicilio en Calle Cuauhtémoc 93, Col. Analco, C.P. 44450, Guadalajara, Jalisco, México, es responsable del tratamiento de sus datos personales.
                        </p>

                        <h2>1. Datos personales que recabamos</h2>
                        <p>Para las finalidades señaladas en el presente aviso, podemos recabar las siguientes categorías de datos personales:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Nombre completo</li>
                            <li>Dirección de correo electrónico</li>
                            <li>Número de teléfono y/o WhatsApp</li>
                            <li>Dirección de envío (calle, colonia, ciudad, estado y código postal)</li>
                            <li>Razón social y RFC (en caso de requerir facturación)</li>
                        </ul>
                        <p>Le informamos que <strong>no recabamos datos personales sensibles</strong> (datos financieros, de salud, ideología, religión, preferencia sexual, entre otros).</p>

                        <h2>2. Finalidades del tratamiento</h2>
                        <p><strong>Finalidades primarias (necesarias):</strong></p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Procesar y dar seguimiento a sus pedidos de calcomanías y/o productos.</li>
                            <li>Realizar el envío de los productos adquiridos.</li>
                            <li>Emitir comprobantes fiscales (facturas) cuando así lo solicite.</li>
                            <li>Atender sus consultas, dudas, quejas o solicitudes de cotización.</li>
                            <li>Dar cumplimiento a obligaciones legales y fiscales.</li>
                        </ul>
                        <p><strong>Finalidades secundarias (no necesarias):</strong></p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Enviar información sobre nuevos productos, promociones o catálogos.</li>
                            <li>Realizar encuestas de satisfacción.</li>
                            <li>Fines estadísticos y de mejora del servicio.</li>
                        </ul>
                        <p>Si usted no desea que sus datos sean tratados para las finalidades secundarias, puede enviar un correo electrónico a <a href="mailto:ventas@calcasparamaquinaria.mx">ventas@calcasparamaquinaria.mx</a> indicando su negativa.</p>

                        <h2>3. Transferencia de datos</h2>
                        <p>Sus datos personales podrán ser transferidos y tratados por terceros únicamente en los siguientes supuestos:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li><strong>Empresas de paquetería y mensajería:</strong> para realizar el envío de productos (FedEx, DHL, Estafeta u otras).</li>
                            <li><strong>Autoridades competentes:</strong> cuando sea requerido por ley o por orden judicial.</li>
                        </ul>

                        <h2>4. Derechos ARCO</h2>
                        <p>Usted tiene derecho a conocer qué datos personales tenemos, para qué los utilizamos y las condiciones de uso (Acceso). Asimismo, es su derecho solicitar la corrección de sus datos en caso de que estén desactualizados (Rectificación); que los eliminemos de nuestros registros cuando considere que no están siendo utilizados adecuadamente (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición).</p>
                        <p>Para ejercer sus derechos ARCO, envíe un correo electrónico a <a href="mailto:ventas@calcasparamaquinaria.mx">ventas@calcasparamaquinaria.mx</a> con la siguiente información:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Nombre completo del titular</li>
                            <li>Descripción clara del derecho que desea ejercer</li>
                            <li>Copia de identificación oficial vigente</li>
                        </ul>
                        <p>Responderemos su solicitud en un plazo máximo de 20 días hábiles.</p>

                        <h2>5. Uso de cookies y tecnologías de rastreo</h2>
                        <p>Nuestro sitio web puede utilizar cookies y tecnologías similares con fines de análisis de navegación y mejora de la experiencia del usuario. Estas tecnologías no recaban datos personales de forma directa. Usted puede desactivar las cookies desde la configuración de su navegador.</p>

                        <h2>6. Modificaciones al aviso de privacidad</h2>
                        <p>Nos reservamos el derecho de efectuar modificaciones o actualizaciones al presente aviso de privacidad. Cualquier cambio será publicado en esta misma página: <a href="/aviso-de-privacidad">www.calcasparamaquinaria.mx/aviso-de-privacidad</a>.</p>

                        <h2>7. Contacto</h2>
                        <p>Si tiene alguna duda sobre este aviso de privacidad, puede contactarnos a través de:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li><strong>Correo electrónico:</strong> <a href="mailto:ventas@calcasparamaquinaria.mx">ventas@calcasparamaquinaria.mx</a></li>
                            <li><strong>Teléfono / WhatsApp:</strong> <a href="tel:+523315289366">+52 (33) 1528 9366</a></li>
                            <li><strong>Dirección:</strong> Calle Cuauhtémoc 93, Col. Analco, C.P. 44450, Guadalajara, Jalisco, México</li>
                        </ul>

                        <div className="border-t border-border pt-6 mt-10">
                            <p className="text-xs text-muted-foreground">
                                <strong>Publim S.A. de C.V.</strong><br />
                                Calle Cuauhtémoc 93, Col. Analco, C.P. 44450, Guadalajara, Jalisco, México.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <WhatsAppButton />
        </main>
    )
}
