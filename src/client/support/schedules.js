/* @flow */

/**
 * @returns entries reduced to single one per destination; arrival times are stored in an array; station ids are removed. 
 */
export default function reduceByDestination(scheduleEntries: Object): Object {
  const processedEntries = {};

  Object.keys(scheduleEntries).forEach(entryKey => {
    const { data: { schedules }, stop } = scheduleEntries[entryKey];      
    const reducedSchedules = [];

    let lastDestination = null;
    let currentSchedule = {};
    schedules.forEach(schedule => {
      const { destination, time } = schedule;
      if (destination !== lastDestination) {
        currentSchedule = { ...schedule, times: [] };
        reducedSchedules.push (currentSchedule);          
      }
      currentSchedule.times.push(time);
      lastDestination = destination;
    });
    
    processedEntries[entryKey] = {
      data: { schedules: reducedSchedules },
      stop,
    };
  });

  return processedEntries;
}
