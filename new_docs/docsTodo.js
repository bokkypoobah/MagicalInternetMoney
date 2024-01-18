const Home = {
  template: `
    <div class="mt-5 pt-3">

    <b-card no-body header="Zombie Babies" class="border-0" header-class="p-1">

      <div>
        <b-card-group deck class="m-2">
          <div v-for="tokenId in allTokenIds">
            <b-card :img-src="'media/' + nftData.tokens[tokenId].imageName" img-alt="Image" img-top style="max-width: 15rem;" class="m-1 p-2">
                <b-card-text>
                  <b>#{{ tokenId }}</b> =
                  <span v-for="(parentId, parentIndex) in nftData.tokens[tokenId].parents">
                    <span v-if="parentIndex > 0">
                     +
                    </span>
                    <b-avatar variant="light" size="1.5rem" :src="'media/punk' + parentId + '.png'"></b-avatar>
                  </span><br />
                  <span v-for="attribute in nftData.tokens[tokenId].attributes"><b-badge pill variant="success">{{ attribute }}</b-badge></span>
                  <span v-for="ancientDNA in nftData.tokens[tokenId].ancientDNA"><b-badge pill variant="warning">🧬 {{ ancientDNA }}</b-badge></span>
              </b-card-text>
            </b-card>
          </div>
        </b-card-group deck class="m-2">
      </div>




      <br />
      <b-card-group deck class="m-2">
        <b-card
          title="#000"
          img-src="images/Baby_000_background.png"
          img-alt="Image"
          img-top
          tag="article"
          style="max-width: 20rem;"
          class="m-1"
        >
          <b-card-text>
            Blah <b-link href="https://opensea.io/assets/0xfe9231f0e6753a8412a00ec1f0028a24d5220ba9/0" target="_blank"><img src="images/381114e-opensea-logomark-flat-colored-blue.png" width="30px" /></b-link>
          </b-card-text>
        </b-card>

        <b-card
          title="#001"
          img-src="images/Baby_001_background.png"
          img-alt="Image"
          img-top
          tag="article"
          style="max-width: 20rem;"
          class="m-1"
        >
          <b-card-text>
            Blah <b-link href="https://opensea.io/assets/0xfe9231f0e6753a8412a00ec1f0028a24d5220ba9/1" target="_blank"><img src="images/381114e-opensea-logomark-flat-colored-blue.png" width="30px" /></b-link>
          </b-card-text>
        </b-card>

        <b-card
          title="#002"
          img-src="images/Baby_002_background.png"
          img-alt="Image"
          img-top
          tag="article"
          style="max-width: 20rem;"
          class="m-1"
        >
          <b-card-text>
            Blah <b-link href="https://opensea.io/assets/0xfe9231f0e6753a8412a00ec1f0028a24d5220ba9/2" target="_blank"><img src="images/381114e-opensea-logomark-flat-colored-blue.png" width="30px" /></b-link>
          </b-card-text>
        </b-card>

        <b-card
          title="#003"
          img-src="images/Baby_003_background.png"
          img-alt="Image"
          img-top
          tag="article"
          style="max-width: 20rem;"
          class="m-1"
        >
          <b-card-text>
            Blah <b-link href="https://opensea.io/assets/0xfe9231f0e6753a8412a00ec1f0028a24d5220ba9/3" target="_blank"><img src="images/381114e-opensea-logomark-flat-colored-blue.png" width="30px" /></b-link>
          </b-card-text>
        </b-card>
      </b-card-group deck>

      <b-card-group deck class="m-2">
        <b-card
          title="#004"
          img-src="images/Baby_004_background.png"
          img-alt="Image"
          img-top
          tag="article"
          style="max-width: 20rem;"
          class="m-1"
        >
          <b-card-text>
            Blah <b-link href="https://opensea.io/assets/0xfe9231f0e6753a8412a00ec1f0028a24d5220ba9/4" target="_blank"><img src="images/381114e-opensea-logomark-flat-colored-blue.png" width="30px" /></b-link>
          </b-card-text>
        </b-card>

        <b-card
          title="#005"
          img-src="images/Baby_005_background.png"
          img-alt="Image"
          img-top
          tag="article"
          style="max-width: 20rem;"
          class="m-1"
        >
          <b-card-text>
            Blah <b-link href="https://opensea.io/assets/0xfe9231f0e6753a8412a00ec1f0028a24d5220ba9/5" target="_blank"><img src="images/381114e-opensea-logomark-flat-colored-blue.png" width="30px" /></b-link>
          </b-card-text>
        </b-card>

        <b-card
          title="#006"
          img-src="images/Baby_006_background.png"
          img-alt="Image"
          img-top
          tag="article"
          style="max-width: 20rem;"
          class="m-1"
        >
          <b-card-text>
            Blah <b-link href="https://opensea.io/assets/0xfe9231f0e6753a8412a00ec1f0028a24d5220ba9/6" target="_blank"><img src="images/381114e-opensea-logomark-flat-colored-blue.png" width="30px" /></b-link>
          </b-card-text>
        </b-card>

        <b-card
          title="#007"
          img-src="images/Baby_007_background.png"
          img-alt="Image"
          img-top
          tag="article"
          style="max-width: 20rem;"
          class="m-1"
        >
          <b-card-text>
            Blah <b-link href="https://opensea.io/assets/0xfe9231f0e6753a8412a00ec1f0028a24d5220ba9/7" target="_blank"><img src="images/381114e-opensea-logomark-flat-colored-blue.png" width="30px" /></b-link>
          </b-card-text>
        </b-card>
      </b-card-group deck>

      <b-card-group deck class="m-2">
        <b-card
          title="#008"
          img-src="images/Baby_008_background.png"
          img-alt="Image"
          img-top
          tag="article"
          style="max-width: 20rem;"
          class="m-1"
        >
          <b-card-text>
            Blah <b-link href="https://opensea.io/assets/0xfe9231f0e6753a8412a00ec1f0028a24d5220ba9/8" target="_blank"><img src="images/381114e-opensea-logomark-flat-colored-blue.png" width="30px" /></b-link>
          </b-card-text>
        </b-card>

      </b-card-group deck>
    </b-card>

    <br />
    <b-card no-body header="Zombies #3636 & #4472" class="border-0" header-class="p-1">
      <div class="m-5">
          <b-carousel
            id="carousel-1"
            v-model="slide"
            :interval="5000"
            controls
            indicators
            background="#ababab"
            img-width="1024"
            img-height="480"
            style="text-shadow: 2px 2px 3px #333;"
            @sliding-start="onSlideStart"
            @sliding-end="onSlideEnd"
            class="mx-5 p-0"
          >

            <!-- Text slides with image -->
            <b-carousel-slide caption="Zombie #3636,"
              text="BASTARD GAN V2 Children And Cats, Bombo, NSW, Australia, Year 2021">
              <b-img-lazy slot="img" class="d-block img-fluid w-100" width="1024" height="480"
                 src="images/IMG_9534_z3636_Bombo_2048x960.png" alt="image slot"></b-img-lazy>
            </b-carousel-slide>

            <b-carousel-slide caption="Zombie #3636 & #4472 Family"
              text="On A Palaeontological Stroll Down The Permian At Gerroa, NSW, Australia">
              <b-img-lazy slot="img" class="d-block img-fluid w-100" width="1024" height="480"
                   src="images/GerroaPhotoAlbumWithZ3636n4472Family_2048x960.png" alt="image slot"></b-img-lazy>
            </b-carousel-slide>

            <b-carousel-slide caption="Zombie #3636 & #4472 Family"
              text="In Year 1637 At Utrecht To Trade Tulip NFT Options">
              <b-img-lazy slot="img" class="d-block img-fluid w-100" width="1024" height="480"
                   src="images/Cryptogs_3185_ZFam_2048x960.png" alt="image slot"></b-img-lazy>
            </b-carousel-slide>

            <b-carousel-slide caption="Zombie #3636 & #4472 Family"
              text="In 1507 At Badaling To Trade Silk NFTs">
              <b-img-lazy slot="img" class="d-block img-fluid w-100" width="1024" height="480"
                   src="images/GreatWall_ZFam_2048x960.png" alt="image slot"></b-img-lazy>
            </b-carousel-slide>

            <b-carousel-slide caption="Zombie Xtreme High Yield Farmers"
              text="With Subjects In 1935 At Milsons Point">
              <b-img-lazy slot="img" class="d-block img-fluid w-100" width="1024" height="480"
                   src="images/PunkstersHarbourBridgeMilsonsPoint1935_1600x750.png" alt="image slot"></b-img-lazy>
            </b-carousel-slide>

            <b-carousel-slide caption="Zombie #3636 & #4472"
              text="Infected By Airborne Z-Alien Virus, Travel To 1,050 BC To Inspect Their Re-analoged Digitalised Cat At Earth-619">
              <b-img-lazy slot="img" class="d-block img-fluid w-100" width="1024" height="480"
                   src="images/Punks_3636_4472_Sphinx_1024x480.png" alt="image slot"></b-img-lazy>
            </b-carousel-slide>

            <b-carousel-slide caption="Zombie Xtreme High Yield Cultivators And Subjects"
              text="Infected By Mutated Z-Alien Virus Strains In 1,050 BC at Earth-619">
              <b-img-lazy slot="img" class="d-block img-fluid w-100" width="1024" height="480"
                   src="images/Punks_3636_4472_Sphinx_Subjects_More_1024x480.png" alt="image slot"></b-img-lazy>
            </b-carousel-slide>

            <b-carousel-slide caption="Zombie Xtreme High Yield Cultivators"
              text="Take Ownership Of Twins At 1888 In The Royal Prince Alfred Hospital, Sydney. Credits - Mitchell Library, State Library of NSW">
              <b-img-lazy slot="img" class="d-block img-fluid w-100" width="1024" height="480"
                   src="images/CryptoBabyPunk_401_Birth_At_RPA_1880-1893_960x450.png" alt="image slot"></b-img-lazy>
            </b-carousel-slide>



            <!-- Slide with blank fluid image to maintain slide aspect ratio -->
            <!--
            <b-carousel-slide caption="Blank Image" img-blank img-alt="Blank image">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse eros felis, tincidunt
                a tincidunt eget, convallis vel est. Ut pellentesque ut lacus vel interdum.
              </p>
            </b-carousel-slide>
            -->

          </b-carousel>

          <p class="mt-4">
            Slide #: {{ slide }}<br>
            Sliding: {{ sliding }}
          </p>
        </div>


        <!--
        <b-card-body class="mb-1">
          <b-list-group>
            <b-list-group-item to="/optinoExplorer/all">Optino Explorer</b-list-group-item>
            <b-list-group-item to="/feedsExplorer/all">Feeds Explorer</b-list-group-item>
            <b-list-group-item to="/tokensExplorer/all">Tokens Explorer</b-list-group-item>
            <b-list-group-item to="/governance/all">Governance</b-list-group-item>
            <b-list-group-item href="https://wiki.optino.io" target="_blank">Wiki</b-list-group-item>
          </b-list-group>
          <b-card-text class="mt-5">
            This is still work in progress. You will need a browser with web3 injection, e.g., using the MetaMask addon. In your web3 wallet, switch to the Ropsten testnet.
            <br />
            <div v-if="!connect">Please click on the power button <b-icon-power variant="primary" shift-v="-1" font-scale="1.5"></b-icon-power> on the top right to connect via MetaMask.</div>
          </b-card-text>
        </b-card-body>
        -->
      </b-card>
    </div>
  `,
  data: function () {
    return {
      slide: 0,
      sliding: null    }
  },
  methods: {
    onSlideStart(slide) {
      this.sliding = true
    },
    onSlideEnd(slide) {
      this.sliding = false
    }
  },
  computed: {
    connect() {
      return store.getters['connection/connect'];
    },
    nftData() {
      return store.getters['tokens/nftData'];
    },
    allTokenIds() {
      return store.getters['tokens/allTokenIds'];
    },
    allParents() {
      return store.getters['tokens/allParents'];
    },
    allAttributes() {
      return store.getters['tokens/allAttributes'];
    },
    allAncientDNAs() {
      return store.getters['tokens/allAncientDNAs'];
    },
  },
  mounted() {
    logInfo("homeModule", "mounted() Called");
  },
};
