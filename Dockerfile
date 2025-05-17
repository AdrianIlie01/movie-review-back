FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

ENV PORT = 3000

EXPOSE 3000

# Comandă de pornire
#Docker foloseste CMD sa porneasca contaienrul dupa ce il construieste
#doar o comanda CMD poate exista intr-un file
# daca am folosi RUN npm start:dev - nu ar merge

CMD ["npm", "run", "start:prod"]

