// https://referralmanager.churchofjesuschrist.org/services/people/mission/14319
const preElement = document.querySelector('body');

const cityList = [
  "Agronomica", "Alvorada", "Arapoti", "Arapuã", "Araucária", "Barbosa Ferraz", "Barrerinhas",
  "Cândido De Abreu", "Cambé", "Campo Belo", "Campo Mourão", "Caninhas", "Canoinhas", "Catuporanga",
  "Cerro Azul", "Colonia", "Corumbataí do Sul", "Curíuva", "Dr. Ulysses", "Escritório", "Faxinal",
  "Fernandes Pinheiro", "Fênix", "Figueira", "Godoy Moreira", "Grande Rio", "Grandes Rios", "Guarani A",
  "Guaraqueçaba", "Guaretá", "Ibaiti", "Ipanema", "Irati", "Iratema", "Iretama", "Itajaí 1", "Itaiti",
  "Ivaí", "Ivaiporã", "Ivai", "Ivaiaporã", "Ivaiapora", "Ivaiaróa", "Ivateira", "Ivatéia", "Iveteira",
  "Jaboti", "Jaguaraiava", "Jaguaraiaíva", "Jaguariaíva", "Jaguariaiva", "Japira", "Jardim Alegre", "Jardim Araucaria",
  "Jardim Da Ordem", "Jardim Alvorada", "Juiz De Fora 2", "Limão B", "Lunardelli", "Luiz Alves", "Lidianópolis", "Manhuaçu",
  "Manoel Ribas", "Mondubin", "Niterói 1", "Nova Tebas", "Ortigueira", "Parque Dos Tropeiros", "Parque Iguaçu",
  "Paraíso", "Patos 1", "Piacaguera", "Pinhalão", "Pioneiros B", "Pôrto Amazonas",
  "Rio Do Sul", "Rio Do Tigre", "Santa Ângelo 2", "Santa Cruz", "Sapopema", "São Francisco Do Sul",
  "São João Do Ivaí", "Siqueira Campos", "Teixeira Soares", "Teofilo Otoni 1", "Tomazina", "Tunas Do Paraná",
  "União Da Vitória", "Umuarama", "Votuporanga", "Wenceslau Braz", "Balsa Nova"
];

const isAddressInCityList = (address) => {
  return cityList.some(city => address?.includes(city));
};

function hasNumber(str) {
  return /\d/.test(str);
}

function timestampToDate(timestamp) {
  // Create a new Date object from the timestamp (in milliseconds)
  const date = new Date(timestamp);

  // Get the year, month, day, hours, minutes, and seconds
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Months are zero-indexed
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Format the date and time as a string
  const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return formattedDate;
}

async function getPeople(url, isUba, hasAnyNumber) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json()
    const persons = json.persons.filter(person => !person.areaId)

    if (isUba) {
      const filteredPersons = persons.filter(person => isAddressInCityList(person.address))
      return filteredPersons
    } else if (hasAnyNumber) {
      const filteredPersons = persons.filter(person => !isAddressInCityList(person.address) && hasNumber(person.address))
      return filteredPersons
    } else {
      const filteredPersons = persons.filter(person => !isAddressInCityList(person.address))
      return filteredPersons
    }
  } catch (error) {
    console.error(error.message);
    return []
  }
}

const persons = await getPeople('https://referralmanager.churchofjesuschrist.org/services/people/mission/14319', true, false)
const urls = persons.map(person => 'https://referralmanager.churchofjesuschrist.org/services/people/' + person.personGuid)


async function fetchMultipleUrls(urls) {
  const response = await Promise.all(urls.map(url => fetch(url)))
  const data = await Promise.all(response.map(res => res.json()))

  const persons = data.map(item => {
    const person = item.person

    return {
      id: person.id,
      name: person.firstName,
      createDate: timestampToDate(new Date(person.createDate).getTime()),
      timestamp: new Date(person.createDate).getTime(),
      address: person.householdInfo.address,
      phoneNumber: person.contactInfo.phoneNumbers[0].number,
      profileLink: 'https://referralmanager.churchofjesuschrist.org/person/' + person.id
    }
  })

  persons.sort((a, b) => b.timestamp - a.timestamp)
  return persons.map(person => {
    return `
    <div class="listItem">
      <a href="${'https://referralmanager.churchofjesuschrist.org/person/' + person.id}">${person.name}</a><br />
      <span><strong>Create Date:</strong> ${person.createDate}</span><br />
      <span><strong>Phone Number:</strong> ${person.phoneNumber}</span><br />
      <span><strong>Address:</strong> ${person.address}</span>
    </div>
    `
  })
}

const realData = await fetchMultipleUrls(urls)
preElement.innerHTML = realData
