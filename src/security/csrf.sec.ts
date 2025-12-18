const csrf = Bun.CSRF.generate()
console.log("CSRF Token: ", csrf);
console.log("Verify CSRF Token: ", Bun.CSRF.verify(csrf));
