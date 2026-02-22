'use client'

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"

export default function TerminosYCondiciones() {
    return (
        <main>
            <Navbar />
            <div className="min-h-screen bg-background">
                <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Términos y Condiciones</h1>
                    <p className="text-sm text-muted-foreground mb-10">Última actualización: 21 de febrero de 2026</p>

                    <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_strong]:text-foreground [&_a]:text-primary [&_a]:underline">

                        <p>
                            Los presentes Términos y Condiciones regulan el uso del sitio web <strong>www.calcasparamaquinaria.mx</strong> (en adelante &ldquo;el Sitio&rdquo;) y la compra de productos ofrecidos por <strong>Publim S.A. de C.V.</strong> (en adelante &ldquo;Publim&rdquo;), con domicilio en Calle Cuauhtémoc 93, Col. Analco, C.P. 44450, Guadalajara, Jalisco, México.
                        </p>
                        <p>Al acceder y utilizar este Sitio, usted acepta los presentes Términos y Condiciones en su totalidad. Si no está de acuerdo, le solicitamos abstenerse de utilizar el Sitio.</p>

                        <h2>1. Productos y servicios</h2>
                        <p>Publim se dedica a la fabricación y comercialización de calcomanías (calcas) y stickers de restauración para maquinaria pesada. Los productos mostrados en el Sitio están sujetos a disponibilidad.</p>
                        <p>Las imágenes de los productos son de referencia. Los colores y detalles pueden variar ligeramente respecto al producto final debido a la calibración de pantalla del dispositivo del usuario.</p>

                        <h2>2. Precios</h2>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Todos los precios mostrados en el Sitio están expresados en <strong>Pesos Mexicanos (MXN)</strong> e <strong>incluyen IVA</strong>.</li>
                            <li>Publim se reserva el derecho de modificar los precios sin previo aviso.</li>
                            <li>El precio aplicable será el vigente al momento de confirmar el pedido.</li>
                        </ul>

                        <h2>3. Proceso de compra</h2>
                        <p>Para realizar una compra:</p>
                        <ol className="list-decimal pl-6 space-y-1">
                            <li>Seleccione los productos deseados en el catálogo.</li>
                            <li>Contáctenos por <strong>WhatsApp</strong> al <a href="https://wa.me/523315289366">+52 (33) 1528 9366</a> o por correo electrónico a <a href="mailto:ventas@calcasparamaquinaria.mx">ventas@calcasparamaquinaria.mx</a> para confirmar su pedido.</li>
                            <li>Le proporcionaremos los datos de pago y confirmaremos la disponibilidad.</li>
                            <li>Una vez recibido el pago, procederemos a la fabricación y/o envío de su pedido.</li>
                        </ol>

                        <h2>4. Formas de pago</h2>
                        <p>Aceptamos las siguientes formas de pago:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Transferencia bancaria (SPEI)</li>
                            <li>Depósito en efectivo (OXXO)</li>
                            <li>Pago por WhatsApp (enlace de pago)</li>
                        </ul>
                        <p>Para pedidos mayoristas, ofrecemos condiciones especiales de pago. Consulte con nuestro equipo de ventas.</p>

                        <h2>5. Envíos</h2>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Realizamos envíos a <strong>toda la República Mexicana</strong>.</li>
                            <li>El tiempo estimado de entrega es de <strong>3 a 7 días hábiles</strong> después de confirmado el pago, dependiendo del destino.</li>
                            <li>Utilizamos paqueterías reconocidas como FedEx, DHL y Estafeta.</li>
                            <li>Todos los envíos incluyen <strong>número de rastreo</strong>.</li>
                            <li>El costo de envío podrá variar según el destino y será informado antes de confirmar el pedido.</li>
                        </ul>

                        <h2>6. Garantía y devoluciones</h2>
                        <p><strong>Garantía:</strong> Todas nuestras calcomanías cuentan con garantía contra defectos de fabricación. Si su producto presenta algún defecto, lo reponemos sin costo adicional.</p>
                        <p><strong>Devoluciones:</strong></p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Tiene hasta <strong>30 días naturales</strong> a partir de la recepción del producto para solicitar una devolución por defecto de fabricación.</li>
                            <li>El producto debe estar en su empaque original y sin haber sido aplicado.</li>
                            <li>Para iniciar una devolución, contáctenos por WhatsApp o correo electrónico proporcionando fotos del producto y la razón de la devolución.</li>
                            <li>No se aceptan devoluciones por cambio de opinión una vez que el producto ha sido fabricado a medida.</li>
                        </ul>

                        <h2>7. Propiedad intelectual</h2>
                        <p>Todo el contenido del Sitio, incluyendo pero no limitado a textos, imágenes, logotipos, diseños, gráficos y software, es propiedad de Publim S.A. de C.V. o de sus respectivos titulares. Queda prohibida su reproducción, distribución o uso no autorizado.</p>
                        <p>Las marcas de maquinaria mencionadas en el Sitio (CAT, Caterpillar, Komatsu, Volvo, John Deere, JCB, Case, Terex, entre otras) son propiedad de sus respectivos titulares. Publim fabrica calcomanías de reemplazo/restauración y no tiene relación comercial directa con dichas marcas.</p>

                        <h2>8. Limitación de responsabilidad</h2>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Publim no se hace responsable por daños derivados de la instalación incorrecta de las calcomanías.</li>
                            <li>La durabilidad de las calcomanías (+6 años a la intemperie) es una estimación basada en condiciones normales de uso y puede variar según las condiciones climáticas y de aplicación.</li>
                            <li>Publim no se responsabiliza por interrupciones temporales del Sitio por mantenimiento o causas de fuerza mayor.</li>
                        </ul>

                        <h2>9. Ley aplicable y jurisdicción</h2>
                        <p>Los presentes Términos y Condiciones se rigen por las leyes vigentes en los Estados Unidos Mexicanos. Para cualquier controversia derivada del uso del Sitio o de la compra de productos, las partes se someten a la jurisdicción de los tribunales competentes de la ciudad de Guadalajara, Jalisco, México, renunciando a cualquier otro fuero que pudiera corresponderles.</p>

                        <h2>10. Modificaciones</h2>
                        <p>Publim se reserva el derecho de modificar los presentes Términos y Condiciones en cualquier momento. Los cambios entrarán en vigor a partir de su publicación en esta página: <a href="/terminos">www.calcasparamaquinaria.mx/terminos</a>.</p>

                        <h2>11. Contacto</h2>
                        <p>Para cualquier duda o aclaración, puede contactarnos a través de:</p>
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
