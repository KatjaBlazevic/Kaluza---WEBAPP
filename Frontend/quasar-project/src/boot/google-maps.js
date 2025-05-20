export default async ({ app }) => {
  const script = document.createElement('script');
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCLvePuBOyBwYrwdeUGkY4pQSzsWcFcRs4';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  await new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = reject;
  });
};
