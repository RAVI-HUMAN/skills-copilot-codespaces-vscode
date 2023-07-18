function skillsMember() {
    var skills = {
        name: 'John',
        age: 30,
        skills: ['js', 'html', 'css'],
        salary: 1000
    };
    var sum = 0;
    for (var i = 0; i < skills.skills.length; i++) {
        sum += skills.skills[i].length;
    }
    return sum;
}