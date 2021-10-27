const { Client } = require("@notionhq/client")
const dotenv = require("dotenv")

dotenv.config()

const notion = new Client({ auth: process.env.NOTION_KEY })

const databaseId = process.env.NOTION_ERROR_DATABASE_ID

module.exports.add  = async (error) => {
  //for (const page of pagesToCreate) {
  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: getPropertiesFromErrors(error),
  })    
  console.log(`Created page: ${error.codigo}-${error.erro}`)
}

function getPropertiesFromErrors(error) {
  const { erro, codigo, linguagem, tipo, software, servidor, arquivo, linha, stack_trace } = error
  const properties = {
    erro: {
      title: [{ type: "text", text: { content: erro } }],
    },
    codigo: {
      rich_text: [
        {
          "type": "text",
          "text": {
            content: `${codigo || '' }`
          }
        },
      ]
    },
    software: {
      rich_text: [
        {
          "type": "text",
          "text": {
            content: `${software || ''}`
          }
        },
      ]
    },
    linguagem: {
      rich_text: [
        {
          "type": "text",
          "text": {
            content: `${linguagem || ''}`
          }
        },
      ]
    },
    tipo: {
      multi_select: tipo ? tipo.split(" ").map( (cada) =>{ return { name: cada};}) : [],
    },
    servidor: {
      rich_text: [
        {
          "type": "text",
          "text": {
            content: `${servidor || ''}`
          }
        },
      ]
    },
    arquivo: {
      rich_text: [
        {
          "type": "text",
          "text": {
            content: `${arquivo || ''}`
          }
        },
      ]
    },
    linha: {
      rich_text: [
        {
          "type": "text",
          "text": {
            content: `${linha || ''}`
          }
        },
      ]
    },
    "stack trace": {
      rich_text: [
        {
          "type": "text",
          "text": {
            content: `${stack_trace || ''}`
          }
        },
      ]
    }

  }
  
  return properties;
}

