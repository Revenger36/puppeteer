import puppeteer from "puppeteer";
import pkg from 'pg';
const { Pool } = pkg;


const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "scrapper",
    password: "0000",
    port: 5432,
});



const getQuotes = async () => {

    const client = await pool.connect().catch(() => {
        console.log("deu erro na conexão")
    })



    const browser = await puppeteer.launch({
        headless: false,
    });

    const page = await browser.newPage();

    await page.goto("https://sescmg.com.br/", {
        waitUntil: "domcontentloaded",
    });


    await page.waitForSelector('.dialog-lightbox-message') //espera o banner
    await page.keyboard.press('Escape') // fecha o banner
    await page.locator('.load-more-programacao').wait() // espera o carregar mais
    await page.click('.load-more-programacao') // clicar no botão +
    await page.waitForSelector('div.load-more-programacao[style="display: none;"]') //espera o carregar mais sumir


    const batchLinks = async (linksBatch, browser) => {
        const programacaoDataArray = []
        await Promisse.all(linksBatch.)

    }
    const links = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('.programacao'))
        return links.map(link => {
            const cardsThumb = link.querySelector('.notice__thumb')
            return {
                link: cardsThumb.getAttribute('href'),
            }
        })
    })

    const programacaoDataArray = []

    for (const link of links) {
        const page2 = await browser.newPage();
        try {

            await page2.goto(link.link, {
                waitUntil: "domcontentloaded"
            });


            const programacaoData = await page2.evaluate(() => {

                const titles = document.querySelector('.post-title').textContent.trim();
                const dates = document.querySelector('.data-local svg').nextSibling.textContent.trim();
                const dados = document?.querySelectorAll('div.col-md-5.textos .item') || null;
                const valor = document.querySelector('div.col-md-5.textos [class="notice__excerpt_inner"]')?.querySelector('strong')?.textContent || null; const descricao = document?.querySelector('.descricao').textContent || undefined;
                const valorTratado = cleanValue(valor)

                function extractConvertNumber(value) {
                    const val = value.match(/\d+/);
                    const number = val ? parseInt(val[0], 10) : null
                    if (number === null) return null;
                    if (value.includes('minutos')) return number;
                    if (value.includes('dias')) return (number * 24) * 60;
                    if (value.includes('horas')) return number * 60
                    return number
                }

                function cleanContent(content) {
                    let cleaned = content.trim();
                    cleaned = cleaned.replace(/\n+/g, ' ');
                    cleaned = cleaned.replace(/\s{2,}/g, ' ').replace('minutos', '')
                    return cleaned;
                }


                function cleanValue(val) {
                    if (val === null) {
                        return undefined
                    } else {
                        let value = val.replace('R$ ', '').replace('.', '').replace(',', '.').replace('anos', '')
                        return Number(value)
                    }

                }

                const dataTratada = cleanContent(dates ? (dates) : null)
                const descricaoTratado = cleanContent(descricao ? descricao : null)
                const duracaoTratada = dados[2] ? dados[2]?.querySelector('span')?.textContent : undefined
                const duracaoPronto = duracaoTratada ? extractConvertNumber(duracaoTratada) : undefined
                const classificacao = dados[1] ? dados[1]?.querySelector('span')?.textContent : undefined
                const classificacaoTratada = classificacao ? cleanValue(classificacao) : undefined

                return {
                    titulo: titles || undefined,
                    data: dataTratada || undefined,
                    local: dados[0]?.querySelector('span')?.textContent || undefined,
                    classificacao: classificacaoTratada || undefined,
                    duracao: duracaoPronto || undefined,
                    valor: valorTratado,
                    descricao: descricaoTratado ? descricaoTratado : undefined
                };
            });
            programacaoData.link = link.link;
            programacaoDataArray.push(programacaoData)
            console.log(`Data from ${link.link}:`, programacaoData);

        } catch (error) {

            console.error(`Failed to load ${link.link}:`, error);
        } finally {

            await page2.close();
        }
    }

    console.log("foi?")

    await client.query('TRUNCATE TABLE scrap')
    await client.query('ALTER SEQUENCE scrap_id_seq RESTART WITH 1')

    for (const data of programacaoDataArray) {
        try {
            await client.query(
                "INSERT INTO scrap (title, data, location, classification, duration, value, description, link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
                [data.titulo, data.data, data.local, data.classificacao, data.duracao, data.valor, data.descricao, data.link]
            );
        } catch (error) {
            console.error("DEU RUIM NA QUERY TIO:", error);
        }
    }


    client.end()




};
getQuotes() // usar Promisse.all, separar os links em batchs usando slice dentro de um for??, depois dar push nas batches pra dentro do array, depois executar a função de executar a batch de 5 e depois limpar o array??