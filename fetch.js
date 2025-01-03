// https://referralmanager.churchofjesuschrist.org/services/people/mission/14319
const preElement = document.querySelector('body');

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

async function getPeople(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json()
    const persons = json.persons.filter(person => !person.areaId)

    return persons
  } catch (error) {
    console.error(error.message);
    return []
  }
}

async function fetchMultipleUrls(peopleArr) {
  const urls = persons.map(peopleArr => 'https://referralmanager.churchofjesuschrist.org/services/people/' + person.personGuid)
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

async function fetchByOrgId(peopleArr, orgId){
  const urls = peopleArr.map(person => `https://referralmanager.churchofjesuschrist.org/services/mission/assignment?address=${person.address}&langCd=por`)
  
  const responses = await Promise.all(urls.map(url => fetch(url)))
  const data = await Promise.all(responses.map(res => res.json()))
  
  const proselytingAreas = data.map(item => item.proselytingAreas ? item : {})
  const newPeople = peopleArr.map((person, index) => {
    return {
      ...person,
      timestamp: new Date(person.createDate).getTime(),
      proselytingArea: proselytingAreas[index]
    }
  }).filter(person => person.proselytingArea?.bestOrgId === orgId)
  
  return newPeople.sort((a, b) => b.timestamp - a.timestamp).map(person => {
    return `
    <div class="listItem">
    <a href="${'https://referralmanager.churchofjesuschrist.org/person/' + person.personGuid}">${person.firstName}</a><br />
    <span><strong>Create Date:</strong> ${timestampToDate(person.timestamp)}</span><br />
    <span><strong>Address:</strong> ${person.address}</span><br />
    <span><strong>Suggested Ward:</strong> ${person.proselytingArea.organizations[0].name}</span><br />
    <span><strong>Suggested Area:</strong> ${person.proselytingArea.proselytingAreas[0].name}</span>
    </div>`
  })
}

const peopleArr = await getPeople('https://referralmanager.churchofjesuschrist.org/services/people/mission/14319')

const realData = await fetchByOrgId(peopleArr, 31859)

preElement.innerHTML = realData
