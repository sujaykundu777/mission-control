## Index DB Tutorial 

```ts
function openDb () {
  //The following code creates a request for a database to be opened asynchronously, after which the database is opened when the request's onsuccess handler is fired:
  let db;
  const DB_NAME = "My_DB";
  const DB_VERSION = 1;

  // open database
  const DBOpenRequest = window.indexedDB.open(DB_NAME, DB_VERSION);
  
 
  // The upgradeneeded event is fired when an attempt was made to open a database with a version number higher than its current version. This event is not cancelable and does not bubble.
  DBOpenRequest.onupgradeneeded = (event) => {

    // the database did not previously exist so create object stores and indexes
    const db = DBOpenRequest.result;

    // on error
    db.onerror = (e) => {
        db = DBOpenRequest.error
        console.log("Error creating database");
    }

    // create an object store for this database
    const objectStore = db.createObjectStore("clients", {keyPath: 'id'});


     // define what data items the objectStore will contain
    objectStore.createIndex("name", "name", {unique: false});
    objectStore.createIndex("bio", "bio", {unique: false})

    const emailIndex = objectStore.createIndex("by_email", "email", {unique: true});
    const companyIndex = objectStore.createIndex("by_company", "company");

    // Populate with initial data
    store.put({email: 'johndoe@gmail.com', company: 'google' ,id: 1});
    store.put({email: 'janedoe@gmail.com', company: 'google', id: 2});
    store.put({email: 'jennydoe@gmail.com', company: 'yahoo', id: 3});
  }

  // on success
  DBOpenRequest.onsuccess = (event) => {
     db = DBOpenRequest.result;

     // Let's try to open the same database with a higher revision version
     const req2 = indexedDB.open("clients", 2);

    // In this case the onblocked handler will be executed
    req2.addEventListener("blocked", () => {
        console.log("Request was blocked");
    });

    //or 

    // In this case the onblocked handler will be executed
    req2.onblocked = () => {
        console.log("Request was blocked");
    }
    
  }

}
```

### Transactions in IndexedDB :

In IndexedDB, a transaction is like a temporary controlled session where you perform one or more database operations safely.

**Think of it like**:

> "Either all operations succeed together, or none of theme are permanently saved".

Example - Library 
```ts

// Does LibraryDB Exist ?
// If No -> create database and trigger onupgradeneed
// If yes -> open exiting DB
const DBOpenRequest = indexedDB.open("LibraryDB", 1);

//  This runs when
// - DB is first created
// - OR version changes
// This is where you define schema
// - object stores
// - indexes
// - migrations
// Think of it like CREATE TABLE books (...)
DBOpenRequest.onupgradeneeded = (event) => {
    const db = event.target.result;

    // Create object store (table)
    // Think of it like
    // Table name = books
    // Primary key = isbn
    // each record uses isbn as unique ID 
    const store = db.createObjectStore("books", {
        keyPath: "isbn"
    });

    // create indexes
    // Indexes improve searching
    // Without index -> Loop entire table
    // With Index -> Fast Lookup
    // Like SQL Indexes
    store.createIndex("title", "title", { unique: false });

    store.createIndex("author", "author", { unique: false });

    console.log("Database setup complete");
};


DBOpenRequest.onsuccess = (event) => {
    const db = event.target.result;

    console.log("Database opened successfully");

    // Adding data after db opens
    
    // creating the transaction
    // db.transactions(storeNames, mode)
    // modes :
    // readonly -> only read data
    // readwrite -> read + modify data
    // versionchange -> schema changes during upgrade
    const tx = db.transaction("books", "readwrite")


    // Accessing the object store 
    // Inside the transaction you get access to the store
    // This is similar to (in sql-style thinking)
    // USE books 
    const store = tx.objectStore("books");

    // Adding records
    // add() -> fails if key exists 
    store.add({
        isbn: 123,
        title: "My Book",
        author: "Sujay"
    })

    // updating reacord
    // put() -> 
    // Insert if record doesn't exist
    // Update if key already exists
    store.put({
        isbn: 123,
        title: "My new book",
        author: "Sujay"
    })

    store.put({
        title: "Quarry Memories",
        author: "Fred", 
        isbn: 123456
    });

    store.put({
        title: "Water Buffaloes", 
        author: "Fred", 
        isbn: 234567
    });

    store.put({
        title: "Bedrock Nights", 
        author: "Barney", 
        isbn: 345678
    });


    // Commit phase
    // This fires only after:
    // - all operations succeed
    // transaction is committed permanently 
    tx.oncomplete = () => {
        // committed
        // At this point data is safely stored.
        console.log("Book added");
        
    }
}
```

### Transaction Lifecycle 

 Note that IndexedDb operations are asynchronous internally so these are not immediately written to disk one-by-one

Transaction starts => Requests Queued => Browser Executes Then
 => If all suceed => commit 
  => If one fails => rollback


```ts
Create transaction
    ↓
Queue requests
    ↓
Requests execute
    ↓
Success?
  /   \
yes    no
 |      |
commit abort
 |      |
oncomplete onerror/onabort
```


### What happens if one operation fails ?

Example:

```ts
store.put(validbook);
store.put(invalidbook); // fails
store.put(anotherbook);

```

If one request fails:
- entire transaction aborts 
- previous successful operations rollback
- database remains consistent

This is called **Atomicity** (a core database concept);

Either **ALL succeed** or **NONE succeed**.

### Why Transactions Matter:

Without transactions:

Write #1 succeeds
Write #2 fails
Write #3 never happens

Your database becomes partially updated. 

> So having Transactions prevent this inconsistency.

### Error handling :

```ts
const tx = db.transaction("books", "readwrite");
const store = tx.objectStore("books");

store.put(book1);
store.put(book2);

tx.oncomplete = () => {
  console.log("Transaction committed");
};

tx.onerror = () => {
  console.log("Transaction failed");
};

tx.onabort = () => {
  console.log("Transaction aborted");
};
```

### Multi-store transactions :

we can also include multiple stores:

```ts
const tx = db.transaction(["books", "authors"], "readwrite");
```

This is powerful for:
- relational updates
- syncing history logs
- undo systems
- collborative apps

Example:

Suppose a client record changes:

You want to:

1. Update client 
2. Add history log
3. Update Sync Queue

All together:

```ts
// using multi stores 
const tx = db.transaction(["clients", "history", "syncQueue"], "readwrite");

tx.objectStore("clients").put(client);

tx.objectStore("history").add({
    clientId,
    action: "updated",
    timestamp: Date.now()
});

tx.objectStore("syncQueue").add({
    type: "client-update",
    clientId
})

```

> If any step fails, nothing gets saved. 

### Why IndexedDB is built around transactions 

IndexedDB is :

- asynchronous
- multi-tab capable
- concurrent
- browser-managed

Transactions help prevent:
- corruption
- race conditions
- partial writes
- cross-tab conflicts

They are the safety layer of IndexedDB.

Think of transaction like:

```ts
Start editing database safely
    ↓
Make changes
    ↓
Save everything together
OR
Cancel everything
```

That's the core idea.