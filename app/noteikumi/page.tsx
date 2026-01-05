import { Container } from "../components/Container";

export default function Page() {
  return (
    <Container
      style={{
        paddingTop: 46,
        paddingBottom: 70,
        fontFamily: "Arial, sans-serif",
        color: "#0f172a",
      }}
    >
      <h1 style={{ fontSize: 34, fontWeight: 900, margin: "0 0 16px" }}>
        Noteikumi
      </h1>

      <section style={{ maxWidth: 860 }}>
  <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900, letterSpacing: -0.3 }}>
    Lietošanas noteikumi
  </h1>

  <p style={{ marginTop: 14, color: "#334155", lineHeight: 1.7 }}>
    Šie lietošanas noteikumi nosaka kārtību, kādā tiek izmantots tiešsaistes
    pakalpojums <strong>AI Google Ads</strong>. Izmantojot Pakalpojumu,
    lietotājs apliecina, ka ir iepazinies ar šiem noteikumiem un tiem piekrīt.
  </p>

  <h2 style={{ marginTop: 26, fontSize: 22, fontWeight: 900 }}>
    1. Pakalpojuma sniedzējs
  </h2>

  <p style={{ color: "#334155", lineHeight: 1.7 }}>
    Pakalpojuma sniedzējs ir <strong>World Union, SIA</strong>, reģ. Nr.
    40203628481, juridiskā adrese: Ozolu iela 13, Dreiliņi, Stopiņu pag.,
    Ropažu nov., Latvija.
  </p>

  <h2 style={{ marginTop: 26, fontSize: 22, fontWeight: 900 }}>
    2. Pakalpojuma apraksts
  </h2>

  <p style={{ color: "#334155", lineHeight: 1.7 }}>
    AI Google Ads ir digitāls rīks, kas analizē lietotāja norādītās mājaslapas
    publiski pieejamo saturu un ģenerē Google Ads kampaņu struktūras,
    reklāmu tekstu un atslēgvārdu ieteikumus.
  </p>

  <p style={{ color: "#334155", lineHeight: 1.7 }}>
    Pakalpojums neveic reklāmu publicēšanu lietotāja vārdā, nepārvalda
    lietotāja Google Ads kontu un sniedz ieteikuma rakstura rezultātus.
    Lietotājs pats ir atbildīgs par rezultātu izmantošanu.
  </p>

  <h2 style={{ marginTop: 26, fontSize: 22, fontWeight: 900 }}>
    3. Atbildības ierobežojums
  </h2>

  <p style={{ color: "#334155", lineHeight: 1.7 }}>
    Pakalpojuma sniedzējs neatbild par reklāmu veiktspēju, klikšķiem,
    konversijām, Google Ads konta ierobežojumiem vai trešo pušu darbībām.
    Pakalpojums tiek nodrošināts “kā ir”.
  </p>

  <h2 id="atmaksa" style={{ marginTop: 26, fontSize: 22, fontWeight: 900 }}>
    4. Maksājumi un atmaksas
  </h2>

  <p style={{ color: "#334155", lineHeight: 1.7 }}>
    Maksa par Pakalpojumu tiek noteikta saskaņā ar cenu lapā norādīto
    piedāvājumu. Tā kā Pakalpojums ir digitāls un tiek izpildīts uzreiz
    pēc piekļuves piešķiršanas, samaksātā maksa netiek automātiski atmaksāta.
  </p>

  <p style={{ color: "#334155", lineHeight: 1.7 }}>
    Atmaksa var tikt izskatīta atsevišķos gadījumos, izvērtējot lietotāja
    iesniegto pretenziju. Lēmums tiek pieņemts individuāli.
  </p>

  <h2 style={{ marginTop: 26, fontSize: 22, fontWeight: 900 }}>
    5. Kontakti
  </h2>

  <p style={{ color: "#334155", lineHeight: 1.7 }}>
    E-pasts: <strong>mediatelecom@inbox.lv</strong><br />
    Tālrunis: <strong>+371 29444795</strong><br />
    Atbalsts: <strong>24/7</strong>
  </p>
</section>

    </Container>
  );
}
