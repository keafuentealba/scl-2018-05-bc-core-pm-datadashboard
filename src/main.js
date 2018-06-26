window.onload = () => {//funcion que se ejecuta cuando carga la venta
  extractCohortsIds()
  .then((ids) =>{
    let select = document.getElementById('cohort');

    for( let i = 0; i < ids.length; i++){
      let option = document.createElement('option');
      option.value = ids[i];
      option.innerHTML = ids[i];

      select.appendChild(option);
    }
  });

}
window.executeStats = () => {// funcion que llama id de index
  let id = document.getElementById('cohort').value;
  let orderBy = document.getElementById('orderBy').value;
  let orderDirection = document.getElementById('order').value.toUpperCase();
  let filter = document.getElementById('filter').value;


  getUserStats(id, orderBy, orderDirection, filter)
  .then((users) => {
    let userList = document.getElementById('users');
    userList.innerHTML = '';

    for(let i = 0; i < users.length; i++){//este for recorre users
      let userRow = document.createElement('div');//creo por dom div y row para user
      userRow.classList.add('row');

      if(i % 2 === 0){//revisa si es par o inpar para agregar en la tabla la clase con el color
        userRow.classList.add('even');//si es para agrega la clase 'even' (css esta en gris)
      }

      let userName = document.createElement('div');//creo un dic por medio dom
      userName.classList.add('col-md-2');//agrego un class col  por dom
      userName.innerHTML = users[i]['name'];//indica que esto es formato html (para obtener la posisicon sub i del arreglo user y finalmente obtener nombre)
      userRow.appendChild(userName);//agrega un nuevo nodo al elemento ()

      let totalPercent = document.createElement('div');
      totalPercent.classList.add('col-md-2');
      totalPercent.innerHTML = users[i]['stats']['percent'];
      userRow.appendChild(totalPercent);

      let percentExercise = document.createElement('div');
      percentExercise.classList.add('col-md-2');
      percentExercise.innerHTML = users[i]['stats']['exercises']['percent'];
      userRow.appendChild(percentExercise)

      let quizzAverage = document.createElement('div');
      quizzAverage.classList.add('col-md-2');
      quizzAverage.innerHTML = users[i]['stats']['quizzes']['scoreAvg'];
      userRow.appendChild(quizzAverage)

      let percentQuizz = document.createElement('div');
      percentQuizz.classList.add('col-md-2');
      percentQuizz.innerHTML = users[i]['stats']['quizzes']['percent'];
      userRow.appendChild(percentQuizz)

      let readComplete = document.createElement('div');
      readComplete.classList.add('col-md-2');
      readComplete.innerHTML = users[i]['stats']['reads']['completed'];
      userRow.appendChild(readComplete)

      userList.appendChild(userRow);
    }
  });
}
