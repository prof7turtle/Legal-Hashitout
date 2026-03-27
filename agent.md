## What we are building
We are building an application gto help speed up the judicial system by smartly managing, organizing and sharing data with concerned stakeholders. Its based on INDIAN JUDICARY SYSTEM

## Instructions and tech stack
- Read README.md for detailed problem statement and tech stack

## Important guidelines
- Remember we are building a professional website so crappy components won't work
- Only use defined colors in global.css, this will be the theme for our application
- You can use other shadcn components if required
- Keep everything modular
- I repeat keep everything as much modular as possible

- Don't Work on too many thing at time
- Break it into small tasks and store them in `TASKS.md`, Keep track of everything there. If a task is completed or pending or some future improvement to add.
- ONly work on a small doable task at a time
- Add checkpoints , after each checkpoint, ask the user to review the website and work on the review

## ROLE 
- Judge
- Lawyer
- Litigant (User)

## Lawyer
- Lawyer should be able to file a case
- View his active and previous cases
- The cases should be arranged basesd on priority
- He should be able to see upcoming hearing
- Client management
    - Should be able to see all his clients and their cases that he is attending
    - Should be able to send message to them (Websocket)

## Judges
- Judge should be able to see his cases
- He can see/add tags to cases or some short note if he wants
- There should be filter to sort cases based on various parameters like criminal or civilian, high priority etc.
- He can assign based on severity of case whether it will be conducted online hearing or offline hearing
- In case of online hearing the judge will set a date and time , and all the stakeholders must be notified 
- The judge will then schedule a meeting based on that time, the credentials and link of meeting should be shared with the stakeholders
- The judge may give next hearing or mark the case as completed
- Later the complete judgement can be uploaded on the portal

- Show a calander of working days based on that court and also show the cases on a date

## Litigant

- HE can track his case
- Contact his lawyer
- Will be notified of next hearing
- He can be a self lawyer and file a case


## How to start
- READ TASK.md to check if some tasks are pending, if they are then work on them
- Else, you are reading this for first time so start by creating task
- READ WORKFLOW.md basic workflow of app is written there
- Take a look at current status of repo the proceed with building the project


## Workflow of platform

- Lawyer or Litigant(self lawyer) files the case
- The case then goes as a request to judge
- The judge accepts the case and assign severity and decide whether it goes as offline case or online case and decide date based on calander of the court
- Lawyer will be notified of timeline of that case along with meeting credential in case of online meeting