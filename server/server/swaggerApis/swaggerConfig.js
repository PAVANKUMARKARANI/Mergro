import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi : '3.0.0',
    info : {
      title :'Node JS APIS',
      version: '1.0.0'
    },
    server:[
      {
      url: 'https://api.demoproject29.dosystemsinc.com/'
      
      }
    ]
  },
  apis:['./server/swaggerApis/*']
}
const swaggerSpec = swaggerJSDoc(options)
//console.log(swaggerSpec);

export default swaggerSpec