import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/app/components/ui/accordion';
import { Card, CardContent } from '@/app/components/ui/card';
import {
  BookOpenText,
  HandHeart,
  Lightbulb,
  MessageCircleHeart,
  Sparkles,
} from 'lucide-react';

export function PreFormGuidance() {
  return (
    <div className="space-y-6">
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex gap-3 pt-1">
          <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1">
              N.B.
            </p>
            <p className="text-sm leading-relaxed text-foreground/90">
              Bikorwa mwituze ryinshi kuburyo bitabangamira abitabiriye igikorwa
              ahubwo imbaraga z&apos;Imana zikorera mu bantu naho hantu nuduce
              twose tuhakikije.
            </p>
          </div>
        </CardContent>
      </Card>

      <Accordion
        type="multiple"
        defaultValue={['uburyo']}
        className="rounded-2xl border border-border/50 bg-white/60 dark:bg-black/40 backdrop-blur-xl px-4"
      >
        <AccordionItem value="uburyo">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <HandHeart className="h-4 w-4 text-primary" /> A. Uburyo
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed text-muted-foreground space-y-2">
            <p>
              Igihe abantu bategereje, cyangwa bari mubindi bikorwa komeza
              usengere buri gikorwa cyose, buri muntu cg ikintu cyose cyiyoborwe
              kandi gikorere mu ubutware bw&apos;Imana isumba kandi ishobora
              byose. Imbaraga z&apos;Imana ziganze (kutarangarira ibindi bintu
              nkabandi, mushake ahantu bamwe bari bugume basengera igikorwa
              abandi bagume mubaje kwivuza babasengera mumitima irindi tsinda
              risengera umuntu kugiti cye.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ijambo">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <BookOpenText className="h-4 w-4 text-primary" /> B. Ijambo
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <p>
              Turaje ngo tubavure, ariko twaje dufite impano ikomeye iruta imiti
              tubazaniye, turikumwe na muganga uhagarariye abanda bose kwisi
              turikumwe ninzobere izi byose. uwo muganga ni Yesu kandi Iyo mpano
              ni Yesu kristo, utanga gukira kuzuye kuko twebwe dukora agace gato
              tukigendera ariko nubwo twagenda Yesu we muragumana nubwo twaba
              dufite umwanya muto ariko Yesu agufitiye umwanya uhagije
              ntakimwirukansa niwowe yaje shaka ngo agukize kandi akomore,
              utwemerere kandi nawe umwerere twese dukorane kugirango tubahe
              impamba yanyu ibagenewe.
            </p>
            <p>
              Nk&apos;uko uyu mubiri wawe ukeneye guhura na muganga ngo
              agusuzume akwandikire umuti kugira ngo ukire indwara, niko
              ubugingo n&apos;umutima wawe na byo bikeneye guhura nayesu Kristo
              ngo agusuzume agukuremo ibyica byose agusigire ibikiza ukeneye
              umuti w&apos;imbabazi za Yesu Kristo kugira ngo ukire ibyaha
              n&apos;umutwaro w&apos;agahinda n&apos;umubabaro wose.
            </p>
            <p className="font-semibold text-foreground">Ese mwizeye gukira?</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="kuganira">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <MessageCircleHeart className="h-4 w-4 text-primary" /> II. Person
              to Person Evangelism
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed text-muted-foreground space-y-4">
            <div>
              <p className="font-semibold text-foreground/80 mb-1">
                A. Indamukanyo
              </p>
              <p>Musuhuze bya Kinyarwanda: muraho; mwiriwe; mwaramutse etc</p>
            </div>
            <div>
              <p className="font-semibold text-foreground/80 mb-1">
                B. Gutangira ikiganiro
              </p>
              <p>
                Mwibwire: nitwa….. najye ndi umwe mubazanye niritsinda ryaje
                kubavura, nanjye nkufitiye inkuru nziza twabazaniye wanyemerera
                nkayigusangiza? niba avuze oya mubaze mukinyabupfura uburwayi
                cyangwa ikibazo cyatumye aza uze gusoza nisengesho niba
                abyemera? ariko Asubije yego urakomeza mubyukuri twaje kubavura,
                ariko twaje dufite impano ikomeye iruta imiti. Twazanye Yesu,
                Muganga uhagarariye abandi bose, utanga gukira kuzuye. Twebwe
                dukora agace gato tukigendera, ariko Yesu we agumana namwe. Ese
                mwizeye ko Imana ishobora kubakiza umubiri n&apos;umutima?
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                  Soma — Zaburi 103:3-5
                </p>
                <p className="italic text-foreground/80">
                  &ldquo;Ni we ubabarira ibyo wakiraniwe byose, Agakiza indwara
                  zawe zose...&rdquo;
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Bivugeho gato — ntuyirenze iminota 2.
                </p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                  Soma — Abaroma 6:23
                </p>
                <p className="italic text-foreground/80">
                  &ldquo;Ibihembo by&apos;ibyaha ni urupfu, ariko impano
                  y&apos;Imana ni ubugingo buhoraho...&rdquo;
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Havugeho gato — nturenze iminota 2.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export function PostFormGuidance() {
  return (
    <div className="space-y-6">
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            VI. Isengesho ry&apos;Icyemezo
          </p>
          <p className="text-base leading-relaxed italic text-foreground/90">
            &ldquo;Data wa twese, ndagushimira ku bw&apos;impano yawe
            y&apos;agaciro. Uyu munsi nemeye ko nancumuye, ariko nemeye ko Yesu
            yampfiriye kugirango mbeho nemeye ko ambera umwami n&apos;Umukiza
            w&apos;ubuzima n&apos;ibyange byose. Ndakwakiriye yesu, ndakwemereye
            unyobore kandi unkoreshe, ube uwanjye nanjye mbe uwawe ibihe byose.
            Amina.&rdquo;
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex gap-3">
          <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              VII. Inama
            </p>
            <p className="text-sm leading-relaxed text-foreground/90">
              Kugira ngo ubutumwa bugire imbaraga, jya ubanza umusenge mu mutima
              wawe mbere yuko utangira kuganira nawe, kugira ngo Umwuka Wera
              akuyobore mu magambo akwiye uwo muntu. Niba atiteguye guhita afata
              icyemezo ako kanya, ntumutindeho cyane; umusigire isengesho rito
              n&apos;ijambo ry&apos;Imana.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
